import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { fileName, fileSize, subjectId, questionCount, fileData } = await req.json();
    
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Processing document:', fileName, 'for user:', user.id);

    // Get user's Gemini API key
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.gemini_api_key) {
      throw new Error('Gemini API key not found. Please add your API key in settings.');
    }

    // Extract text from PDF (simplified - in real implementation you'd use a PDF parser)
    const textContent = await extractTextFromPDF(fileData);
    
    // Store document in database
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .insert({
        name: fileName,
        user_id: user.id,
        subject_id: subjectId,
        file_size: fileSize,
        file_path: `documents/${user.id}/${fileName}`,
        text_content: textContent,
        processed: false
      })
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to store document: ${docError.message}`);
    }

    console.log('Document stored, generating questions...');

    // Generate questions using Gemini
    const questions = await generateQuestions(textContent, questionCount, settings.gemini_api_key);
    
    // Store questions in database
    const questionInserts = questions.map(q => ({
      user_id: user.id,
      document_id: document.id,
      subject_id: subjectId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer
    }));

    const { error: questionsError } = await supabaseClient
      .from('questions')
      .insert(questionInserts);

    if (questionsError) {
      throw new Error(`Failed to store questions: ${questionsError.message}`);
    }

    // Mark document as processed
    await supabaseClient
      .from('documents')
      .update({ processed: true })
      .eq('id', document.id);

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId: document.id,
        questionsGenerated: questions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function extractTextFromPDF(fileData: ArrayBuffer): Promise<string> {
  // For now, return a placeholder - in a real implementation you'd use a PDF parsing library
  // This is a simplified version since proper PDF parsing requires additional libraries
  return "This is extracted text from the PDF document. In a real implementation, this would contain the actual PDF content extracted using a proper PDF parsing library.";
}

async function generateQuestions(textContent: string, questionCount: number, geminiApiKey: string) {
  const prompt = `Based on the following text content, generate exactly ${questionCount} multiple-choice questions. Each question should have 4 options and indicate which option is correct (0, 1, 2, or 3).

Text content:
${textContent.substring(0, 8000)} // Limit text length for API

Please respond with a JSON array in this exact format:
[
  {
    "question": "What is the main topic discussed?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0
  }
]

Make sure the questions are relevant to the content and test understanding of key concepts. Ensure all questions have exactly 4 options and the correct_answer is a number between 0 and 3.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error response:', errorText);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error('Unexpected Gemini response structure:', data);
    throw new Error('Invalid response from Gemini API');
  }
  
  const generatedText = data.candidates[0].content.parts[0].text;
  console.log('Generated text from Gemini:', generatedText);
  
  // Extract JSON from the response
  const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('No JSON found in Gemini response:', generatedText);
    throw new Error('Failed to extract questions from Gemini response');
  }

  try {
    const questions = JSON.parse(jsonMatch[0]);
    
    // Validate the questions structure
    if (!Array.isArray(questions)) {
      throw new Error('Questions is not an array');
    }
    
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct_answer !== 'number') {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      if (q.correct_answer < 0 || q.correct_answer > 3) {
        throw new Error(`Invalid correct_answer at index ${index}: ${q.correct_answer}`);
      }
    });
    
    console.log(`Successfully parsed ${questions.length} questions`);
    return questions;
  } catch (parseError) {
    console.error('Failed to parse questions JSON:', parseError);
    console.error('Raw JSON string:', jsonMatch[0]);
    throw new Error('Failed to parse questions JSON from Gemini response');
  }
}

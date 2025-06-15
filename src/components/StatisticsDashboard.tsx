
import { TrendingUp, TrendingDown, Minus, Trophy, Target, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStatistics } from '@/hooks/useStatistics';
import { format, parseISO } from 'date-fns';

const StatisticsDashboard = () => {
  const { statistics, isLoading } = useStatistics();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No statistics available yet. Complete some quizzes to see your progress!</p>
      </div>
    );
  }

  const { overallStatistics, subjectStatistics, quizStatistics } = statistics;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMasteryColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getMasteryLabel = (score: number) => {
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Overall Mastery</p>
                <p className={`text-xl font-bold ${getMasteryColor(overallStatistics.overallMastery)}`}>
                  {overallStatistics.overallMastery}%
                </p>
                <p className="text-xs text-gray-500">{getMasteryLabel(overallStatistics.overallMastery)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-xl font-bold text-blue-900">{overallStatistics.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Study Streak</p>
                <p className="text-xl font-bold text-green-900">{overallStatistics.studyStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-xl font-bold text-purple-900">{overallStatistics.totalQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectStatistics.map((subject) => (
              <div key={subject.subjectId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{subject.subjectName}</h3>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(subject.progressTrend)}
                    <span className={`font-bold ${getMasteryColor(subject.masteryScore)}`}>
                      {subject.masteryScore}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                  <div>Quizzes: {subject.totalQuizzes}</div>
                  <div>Attempts: {subject.totalAttempts}</div>
                  <div>Last studied: {subject.lastStudied ? format(parseISO(subject.lastStudied), 'MMM dd') : 'Never'}</div>
                </div>
                <Progress value={subject.masteryScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallStatistics.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.quizName}</p>
                  <p className="text-sm text-gray-600">{activity.subjectName}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getMasteryColor(activity.score)}`}>{activity.score}%</p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(activity.date), 'MMM dd, HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {quizStatistics.map((quiz) => (
              <div key={quiz.quizId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{quiz.quizName}</h4>
                    <p className="text-sm text-gray-600">{quiz.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(quiz.progressTrend)}
                      <span className={`font-bold ${getMasteryColor(quiz.averageScore)}`}>
                        {quiz.averageScore}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{quiz.masteryLevel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>Attempts: {quiz.totalAttempts}</div>
                  <div>Best: {quiz.bestScore}%</div>
                  <div>Last: {quiz.lastAttempted ? format(parseISO(quiz.lastAttempted), 'MMM dd') : 'Never'}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDashboard;

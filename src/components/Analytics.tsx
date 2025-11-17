import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Users,
  Clock,
  Target,
  Award,
  Zap,
  BookOpen,
  Search,
  Filter,
  Download,
  Share2,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Network,
  Eye,
  RefreshCw,
  Star
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

// Mock data for analytics
const studyPerformanceData = [
  { date: 'Mon', sessions: 3, accuracy: 85, retention: 78 },
  { date: 'Tue', sessions: 5, accuracy: 92, retention: 82 },
  { date: 'Wed', sessions: 4, accuracy: 88, retention: 85 },
  { date: 'Thu', sessions: 6, accuracy: 95, retention: 89 },
  { date: 'Fri', sessions: 7, accuracy: 93, retention: 91 },
  { date: 'Sat', sessions: 4, accuracy: 87, retention: 88 },
  { date: 'Sun', sessions: 5, accuracy: 90, retention: 87 }
];

const cognitiveData = [
  { level: 'Recall', score: 92, cards: 45 },
  { level: 'Comprehension', score: 88, cards: 32 },
  { level: 'Application', score: 76, cards: 28 },
  { level: 'Analysis', score: 71, cards: 18 },
  { level: 'Synthesis', score: 65, cards: 12 },
  { level: 'Evaluation', score: 58, cards: 8 }
];

const subjectPerformance = [
  { subject: 'Mathematics', accuracy: 95, timeSpent: 120, improvement: 12 },
  { subject: 'Science', accuracy: 88, timeSpent: 95, improvement: 8 },
  { subject: 'History', accuracy: 82, timeSpent: 75, improvement: -3 },
  { subject: 'Literature', accuracy: 91, timeSpent: 110, improvement: 15 },
  { subject: 'Languages', accuracy: 76, timeSpent: 65, improvement: 5 }
];

const knowledgeGraphData = [
  { concept: 'Fundamentals', mastery: 95, connections: 12 },
  { concept: 'Advanced Topics', mastery: 78, connections: 8 },
  { concept: 'Applications', mastery: 65, connections: 15 },
  { concept: 'Problem Solving', mastery: 82, connections: 10 },
  { concept: 'Critical Thinking', mastery: 71, connections: 6 }
];

const aiModelMetrics = [
  { model: 'Card Generation', accuracy: 94, usage: 1250, efficiency: 87 },
  { model: 'Difficulty Adaption', accuracy: 89, usage: 980, efficiency: 92 },
  { model: 'Content Extraction', accuracy: 96, usage: 450, efficiency: 85 },
  { model: 'Question Generation', accuracy: 91, usage: 1100, efficiency: 88 }
];

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("performance");

  const StatCard = ({ title, value, change, icon: Icon, color, trend }: StatCardProps) => (
    <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-200/50 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trend === 'up' && <ArrowUp className="w-4 h-4" />}
          {trend === 'down' && <ArrowDown className="w-4 h-4" />}
          <span className="font-medium">{change}</span>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-black mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </Card>
  );

  const MetricCard = ({ title, value, subtitle, icon: Icon, color }: MetricCardProps) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-black">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">AI Learning Analytics</h1>
            <p className="text-gray-600">Advanced insights into your learning progress and AI model performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Learning Efficiency"
            value="94.5%"
            change="+12%"
            icon={Brain}
            color="from-blue-500 to-blue-600"
            trend="up"
          />
          <StatCard 
            title="AI Accuracy Score"
            value="91.2%"
            change="+5.3%"
            icon={Target}
            color="from-purple-500 to-purple-600"
            trend="up"
          />
          <StatCard 
            title="Knowledge Retention"
            value="87.8%"
            change="+8.1%"
            icon={TrendingUp}
            color="from-green-500 to-green-600"
            trend="up"
          />
          <StatCard 
            title="Study Streak"
            value="23 days"
            change="+2 days"
            icon={Zap}
            color="from-orange-500 to-orange-600"
            trend="up"
          />
        </div>

        <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="performance" className="flex-1 text-xs md:text-sm py-2">Learning Performance</TabsTrigger>
            <TabsTrigger value="cognitive" className="flex-1 text-xs md:text-sm py-2">Cognitive Analysis</TabsTrigger>
            <TabsTrigger value="ai-models" className="flex-1 text-xs md:text-sm py-2">AI Models</TabsTrigger>
            <TabsTrigger value="knowledge" className="flex-1 text-xs md:text-sm py-2">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 text-xs md:text-sm py-2">AI Insights</TabsTrigger>
          </TabsList>

          {/* Learning Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Weekly Study Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Retention Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={studyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="#22C55E" 
                      strokeWidth={3}
                      dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-black mb-4">Subject Performance Analysis</h3>
              <div className="space-y-4">
                {subjectPerformance.map((subject, index) => (
                  <div key={subject.subject} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-black">{subject.subject}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={subject.improvement > 0 ? "default" : "destructive"} className="text-xs">
                          {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                        </Badge>
                        <span className="text-sm font-bold text-black">{subject.accuracy}%</span>
                      </div>
                    </div>
                    <Progress value={subject.accuracy} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{subject.timeSpent} min studied</span>
                      <span>{subject.accuracy}% accuracy</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Cognitive Analysis Tab */}
          <TabsContent value="cognitive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Bloom's Taxonomy Analysis
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={cognitiveData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} tickCount={6} />
                    <Radar
                      name="Cognitive Level"
                      dataKey="score"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Cognitive Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cognitiveData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, value }) => `${level}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="score"
                    >
                      {cognitiveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Higher-Order Thinking"
                value="68%"
                subtitle="Analysis & Evaluation"
                icon={Lightbulb}
                color="bg-purple-500"
              />
              <MetricCard 
                title="Problem Solving"
                value="82%"
                subtitle="Application Skills"
                icon={Zap}
                color="bg-blue-500"
              />
              <MetricCard 
                title="Critical Analysis"
                value="74%"
                subtitle="Synthesis & Evaluation"
                icon={Search}
                color="bg-green-500"
              />
            </div>
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="ai-models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  AI Model Performance
                </h3>
                <div className="space-y-4">
                  {aiModelMetrics.map((model, index) => (
                    <div key={model.model} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-black">{model.model}</h4>
                        <Badge className="bg-blue-100 text-blue-800">{model.accuracy}%</Badge>
                      </div>
                      <Progress value={model.accuracy} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{model.usage.toLocaleString()} uses</span>
                        <span>{model.efficiency}% efficiency</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Model Usage Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={studyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard 
                title="Card Generation Rate"
                value="2.3/min"
                subtitle="Cards per minute"
                icon={Zap}
                color="bg-green-500"
              />
              <MetricCard 
                title="Content Extraction"
                value="96%"
                subtitle="Accuracy rate"
                icon={Eye}
                color="bg-blue-500"
              />
              <MetricCard 
                title="Adaptive Learning"
                value="89%"
                subtitle="Personalization score"
                icon={RefreshCw}
                color="bg-purple-500"
              />
              <MetricCard 
                title="Processing Speed"
                value="1.2s"
                subtitle="Average response time"
                icon={Clock}
                color="bg-orange-500"
              />
            </div>
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  Knowledge Mastery Map
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={knowledgeGraphData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="concept" type="category" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="mastery" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Concept Connections
                </h3>
                <div className="space-y-4">
                  {knowledgeGraphData.map((item, index) => (
                    <div key={item.concept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-black">{item.concept}</h4>
                        <p className="text-sm text-gray-600">{item.connections} connections</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-black">{item.mastery}%</span>
                        </div>
                        <Progress value={item.mastery} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-black mb-4">Knowledge Graph Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Strong Connections</h4>
                  </div>
                  <p className="text-sm text-blue-700">Your knowledge of Applications shows strong connections to Fundamentals</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Learning Gap</h4>
                  </div>
                  <p className="text-sm text-yellow-700">Focus on Critical Thinking to strengthen your analytical skills</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Mastery Area</h4>
                  </div>
                  <p className="text-sm text-green-700">Fundamentals show excellent mastery and can support advanced topics</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Personalized Learning Insights
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900 mb-1">Optimal Study Time</h4>
                    <p className="text-sm text-blue-700">Your performance peaks between 2-4 PM. Schedule challenging topics during this window.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900 mb-1">Learning Style</h4>
                    <p className="text-sm text-green-700">You excel with visual aids and real-world examples. AI-generated image cards boost retention by 23%.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-medium text-purple-900 mb-1">Difficulty Progression</h4>
                    <p className="text-sm text-purple-700">Ready for more advanced analysis questions. AI suggests increasing difficulty by 15%.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Tutor Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-900">Focus Areas</h4>
                      <Badge className="bg-orange-200 text-orange-800">High Priority</Badge>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">Strengthen analytical thinking with more case studies</p>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                      Generate Practice Cards
                    </Button>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-indigo-900">Learning Path</h4>
                      <Badge className="bg-indigo-200 text-indigo-800">Adaptive</Badge>
                    </div>
                    <p className="text-sm text-indigo-700 mb-2">Next milestone: Master synthesis-level questions</p>
                    <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700">
                      View Progress Path
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-black mb-4">AI-Powered Study Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-blue-900">Smart Spaced Repetition</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">AI has scheduled 12 cards for optimal retention timing</p>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Start Review Session
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-purple-900">Weakness Analysis</h4>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">Focus on equation solving - 34% below average</p>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Practice Weaknesses
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-green-900">Goal Progress</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-3">87% towards weekly study goal - keep it up!</p>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    View Goals
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
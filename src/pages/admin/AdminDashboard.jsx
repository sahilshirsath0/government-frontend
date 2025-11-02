// pages/admin/AdminDashboard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  ImageIcon, 
  Award, 
  Users, 
  MessageSquare,
  FileText,
  ArrowRight,
  Calendar,
  TrendingUp,
  MapPin
} from 'lucide-react';
import DashboardStats from './DashboardStats';

const AdminDashboard = () => {
  const { t } = useTranslation('admin');

  const quickActions = [
    {
      title: t('dashboard.quickActions.announcements'),
      description: t('dashboard.quickActions.announcementsDesc'),
      icon: Megaphone,
      path: '/admin-dashboard/announcements',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: t('dashboard.quickActions.gallery'),
      description: t('dashboard.quickActions.galleryDesc'),
      icon: ImageIcon,
      path: '/admin-dashboard/gallery',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      title: 'नागरिक सेवा',
      description: 'Manage citizen services and applications',
      icon: Users,
      path: '/admin-dashboard/nagrik-seva',
      color: 'from-purple-500 to-fuchsia-500',
      bgColor: 'from-purple-50 to-fuchsia-50'
    },
    {
      title: 'Village Details',
      description: 'Manage village information in multiple languages',
      icon: MapPin,
      path: '/admin-dashboard/village-details',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50'
    },
    {
      title: 'Programs',
      description: 'Manage village programs and initiatives',
      icon: Award,
      path: '/admin-dashboard/programs',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      title: t('dashboard.quickActions.members'),
      description: t('dashboard.quickActions.membersDesc'),
      icon: Users,
      path: '/admin-dashboard/members',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50'
    },
    {
      title: t('dashboard.quickActions.feedback'),
      description: t('dashboard.quickActions.feedbackDesc'),
      icon: MessageSquare,
      path: '/admin-dashboard/feedback',
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50'
    },
    {
      title: t('dashboard.quickActions.documents'),
      description: t('dashboard.quickActions.documentsDesc'),
      icon: FileText,
      path: '#',
      color: 'from-gray-500 to-slate-500',
      bgColor: 'from-gray-50 to-slate-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      
<div className=''>
  <DashboardStats />

</div>
      {/* Stats */}
    

      {/* Quick Actions Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
            Quick Actions
          </h2>
          <p className="text-gray-600 mt-2 ml-6">Access key administrative functions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.color} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                      <div className={`relative bg-gradient-to-r ${action.color} p-4 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-100 group-hover:bg-white p-2.5 rounded-xl transition-all duration-300 group-hover:scale-125">
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {action.description}
                  </p>
                </div>

                {/* Bottom Border Animation */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${action.color} w-0 group-hover:w-full transition-all duration-500`}></div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('dashboard.recentActivity.title')}
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {t('dashboard.recentActivity.noAnnouncements')}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {t('dashboard.recentActivity.today')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">{t('dashboard.recentActivity.empty')}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('dashboard.quickStats.title')}
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {t('dashboard.quickStats.totalMembers')}
                  </span>
                </div>
                <span className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">0</span>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-100 hover:shadow-md transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl shadow-md">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {t('dashboard.quickStats.totalAwards')}
                  </span>
                </div>
                <span className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">0</span>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border border-red-100 hover:shadow-md transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl shadow-md">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {t('dashboard.quickStats.pendingFeedback')}
                  </span>
                </div>
                <span className="text-4xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

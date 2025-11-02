// pages/admin/DashboardStats.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Megaphone, 
  ImageIcon, 
  Award, 
  Users, 
  MessageSquare,
  MapPin,
  FileText
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './DashboardStats.css';


const DashboardStats = () => {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState({
    announcements: 0,
    gallery: 0,
    awards: 0,
    members: 0,
    feedback: 0,
    nagrikSevaApplications: 0,
    programs: 0
  });


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          announcements, 
          gallery, 
          awards, 
          members, 
          feedback,
          nagrikSevaApplications,
          programs
        ] = await Promise.all([
          adminAPI.getAnnouncements().catch(() => ({ data: { data: [] } })),
          adminAPI.getGallery().catch(() => ({ data: { data: [] } })),
          adminAPI.getAwards().catch(() => ({ data: { data: [] } })),
          adminAPI.getMembers().catch(() => ({ data: { data: [] } })),
          adminAPI.getFeedback({ status: 'pending' }).catch(() => ({ data: { data: [] } })),
          adminAPI.getNagrikSevaApplications().catch(() => ({ data: { data: [] } })),
          adminAPI.getPrograms().catch(() => ({ data: { data: [] } }))
        ]);


        setStats({
          announcements: announcements.data.data?.length || 0,
          gallery: gallery.data.data?.length || 0,
          awards: awards.data.data?.length || 0,
          members: members.data.data?.length || 0,
          feedback: feedback.data.data?.length || 0,
          nagrikSevaApplications: nagrikSevaApplications.data.data?.length || 0,
          programs: programs.data.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };


    fetchStats();
  }, []);


  const statItems = [
    {
      title: t('dashboard.stats.totalAnnouncements') || 'Announcements',
      value: stats.announcements,
      icon: Megaphone,
      color: 'stat-blue-cyan'
    },
    {
      title: t('dashboard.stats.totalGallery') || 'Gallery Items',
      value: stats.gallery,
      icon: ImageIcon,
      color: 'stat-green-emerald'
    },
    {
      title: 'नागरिक सेवा',
      value: stats.nagrikSevaApplications,
      icon: Users,
      color: 'stat-purple-fuchsia'
    },
    {
      title: 'Programs',
      value: stats.programs,
      icon: Award,
      color: 'stat-yellow-orange'
    },
    {
      title: t('dashboard.stats.pendingFeedback') || 'Pending Feedback',
      value: stats.feedback,
      icon: MessageSquare,
      color: 'stat-red-pink'
    }
  ];


  return (
    <div className="dashboard-stats-container">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <p className="stat-title">
                  {item.title}
                </p>
                <p className="stat-value">
                  {item.value}
                </p>
              </div>
              <div className={`stat-icon ${item.color}`}>
                <Icon className="icon" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


export default DashboardStats;

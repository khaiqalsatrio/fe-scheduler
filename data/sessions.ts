export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
}

export interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  title: string;
  track: string;
  speakers: Speaker[];
}

export const sessions: Session[] = [
  {
    id: '1',
    date: 'Feb 3',
    startTime: '9:10 AM',
    endTime: '9:30 AM',
    duration: '20 min',
    title: 'Evolving Insights in the Age of AI',
    track: 'Track 1',
    speakers: [
      {
        id: 's1',
        name: 'Isla Yu',
        title: 'Head of Customer Insights',
        company: 'Cathay Pacific Airways',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
    ],
  },
  {
    id: '2',
    date: 'Feb 3',
    startTime: '9:30 AM',
    endTime: '9:50 AM',
    duration: '20 min',
    title: "How Nestlé's Transformation Team Scales Insights",
    track: 'Track 1',
    speakers: [
      {
        id: 's2',
        name: 'Lester Sualog',
        title: 'Head of APAC, AI Research',
        company: 'Bolt Insight',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
      {
        id: 's3',
        name: 'Chloris Elon',
        title: 'Zone AOA VP Business Performance',
        company: 'Nestle',
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
    ],
  },
  {
    id: '3',
    date: 'Feb 3',
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    duration: '30 min',
    title: 'Building Data-Driven Organizations',
    track: 'Track 2',
    speakers: [
      {
        id: 's4',
        name: 'Marcus Chen',
        title: 'Chief Data Officer',
        company: 'TechCorp Asia',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
    ],
  },
  {
    id: '4',
    date: 'Feb 4',
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    duration: '45 min',
    title: 'Future of Customer Experience',
    track: 'Track 1',
    speakers: [
      {
        id: 's5',
        name: 'Sarah Williams',
        title: 'VP of Customer Success',
        company: 'Global Retail Inc',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
    ],
  },
  {
    id: '5',
    date: 'Feb 4',
    startTime: '10:00 AM',
    endTime: '10:20 AM',
    duration: '20 min',
    title: 'AI-Powered Analytics in Practice',
    track: 'Track 2',
    speakers: [
      {
        id: 's6',
        name: 'James Park',
        title: 'Director of Analytics',
        company: 'DataTech Solutions',
        avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
    ],
  },
];

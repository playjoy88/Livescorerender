'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Mock match data
const mockMatches = [
  {
    id: 'match-001',
    homeTeam: {
      id: 'team-001',
      name: 'Manchester United',
      logo: '/teams/manchester-united.png',
      score: 2
    },
    awayTeam: {
      id: 'team-002',
      name: 'Arsenal',
      logo: '/teams/arsenal.png',
      score: 1
    },
    league: {
      id: 'league-001',
      name: 'Premier League',
      country: 'England',
      logo: '/leagues/premier-league.png'
    },
    stadium: 'Old Trafford',
    date: '2025-05-10T15:00:00Z',
    status: 'scheduled',
    featured: true
  },
  {
    id: 'match-002',
    homeTeam: {
      id: 'team-003',
      name: 'Liverpool',
      logo: '/teams/liverpool.png',
      score: 3
    },
    awayTeam: {
      id: 'team-004',
      name: 'Manchester City',
      logo: '/teams/manchester-city.png',
      score: 3
    },
    league: {
      id: 'league-001',
      name: 'Premier League',
      country: 'England',
      logo: '/leagues/premier-league.png'
    },
    stadium: 'Anfield',
    date: '2025-05-09T17:30:00Z',
    status: 'completed',
    featured: true
  },
  {
    id: 'match-003',
    homeTeam: {
      id: 'team-005',
      name: 'Barcelona',
      logo: '/teams/barcelona.png',
      score: 4
    },
    awayTeam: {
      id: 'team-006',
      name: 'Real Madrid',
      logo: '/teams/real-madrid.png',
      score: 0
    },
    league: {
      id: 'league-002',
      name: 'La Liga',
      country: 'Spain',
      logo: '/leagues/la-liga.png'
    },
    stadium: 'Camp Nou',
    date: '2025-05-08T20:00:00Z',
    status: 'completed',
    featured: false
  },
  {
    id: 'match-004',
    homeTeam: {
      id: 'team-007',
      name: 'Buriram United',
      logo: '/teams/buriram-united.png',
      score: null
    },
    awayTeam: {
      id: 'team-008',
      name: 'Muangthong United',
      logo: '/teams/muangthong-united.png',
      score: null
    },
    league: {
      id: 'league-003',
      name: 'Thai League',
      country: 'Thailand',
      logo: '/leagues/thai-league.png'
    },
    stadium: 'Chang Arena',
    date: '2025-05-15T18:00:00Z',
    status: 'scheduled',
    featured: true
  }
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-gray-100 text-gray-800';
  let label = status;
  
  switch (status) {
    case 'live':
      color = 'bg-red-100 text-red-800';
      label = 'Live';
      break;
    case 'scheduled':
      color = 'bg-blue-100 text-blue-800';
      label = 'Scheduled';
      break;
    case 'completed':
      color = 'bg-green-100 text-green-800';
      label = 'Completed';
      break;
    case 'postponed':
      color = 'bg-yellow-100 text-yellow-800';
      label = 'Postponed';
      break;
    case 'canceled':
      color = 'bg-red-100 text-red-800';
      label = 'Canceled';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Main component
export default function MatchManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  
  // Unique leagues for filter
  const leagues = Array.from(new Set(mockMatches.map(match => match.league.id)))
    .map(id => {
      const match = mockMatches.find(m => m.league.id === id);
      return match ? match.league : null;
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      country: string;
      logo: string;
    }[];
  
  // Filter matches based on search and status filter
  const filteredMatches = mockMatches.filter(match => {
    const matchesSearch = 
      match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.stadium.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || match.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Count matches by status
  const scheduledCount = mockMatches.filter(match => match.status === 'scheduled').length;
  const completedCount = mockMatches.filter(match => match.status === 'completed').length;
  const liveCount = mockMatches.filter(match => match.status === 'live').length;
  const featuredCount = mockMatches.filter(match => match.featured).length;
  
  return (
    <div className="space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">Total Matches</p>
          <h3 className="text-2xl font-bold text-gray-800">{mockMatches.length}</h3>
          <div className="flex items-center mt-2">
            <StatusBadge status="scheduled" />
            <span className="text-xs text-gray-500 ml-2">{scheduledCount} scheduled</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">Live Matches</p>
          <h3 className="text-2xl font-bold text-red-600">{liveCount}</h3>
          <p className="text-xs text-gray-500 mt-2">Currently being played</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">Completed Matches</p>
          <h3 className="text-2xl font-bold text-gray-800">{completedCount}</h3>
          <div className="flex items-center mt-2">
            <StatusBadge status="completed" />
            <span className="text-xs text-gray-500 ml-2">With results</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-1">Featured Matches</p>
          <h3 className="text-2xl font-bold text-indigo-600">{featuredCount}</h3>
          <p className="text-xs text-gray-500 mt-2">Highlighted on homepage</p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Match Management
          </h1>
          
          <Link href="/admin/matches/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Match
            </button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          {/* League filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              defaultValue="all"
            >
              <option value="all">All Leagues</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Matches table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  League
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stadium
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No matches found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredMatches.map(match => (
                  <React.Fragment key={match.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {match.homeTeam.logo ? (
                                <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-6 h-6 object-contain" />
                              ) : (
                                <span className="text-xs">{match.homeTeam.name.substring(0, 2)}</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 mt-1 truncate max-w-[60px]">{match.homeTeam.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-gray-900">{match.status === 'completed' ? match.homeTeam.score : '-'}</span>
                            <span className="text-gray-500">vs</span>
                            <span className="font-bold text-gray-900">{match.status === 'completed' ? match.awayTeam.score : '-'}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {match.awayTeam.logo ? (
                                <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-6 h-6 object-contain" />
                              ) : (
                                <span className="text-xs">{match.awayTeam.name.substring(0, 2)}</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 mt-1 truncate max-w-[60px]">{match.awayTeam.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                            {match.league.logo ? (
                              <img src={match.league.logo} alt={match.league.name} className="w-4 h-4 object-contain" />
                            ) : (
                              <span className="text-xs">{match.league.name.substring(0, 1)}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{match.league.name}</div>
                            <div className="text-xs text-gray-500">{match.league.country}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(match.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{match.stadium}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={match.status} />
                        {match.featured && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setExpandedMatchId(expandedMatchId === match.id ? null : match.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {expandedMatchId === match.id ? 'Hide Details' : 'View Details'}
                        </button>
                        <Link href={`/admin/matches/${match.id}/edit`}>
                          <button className="text-blue-600 hover:text-blue-900">
                            Edit
                          </button>
                        </Link>
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedMatchId === match.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="flex justify-between">
                            <div className="w-1/2">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Match Details</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between mb-4">
                                  <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                      {match.homeTeam.logo ? (
                                        <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 object-contain" />
                                      ) : (
                                        <span>{match.homeTeam.name.substring(0, 2)}</span>
                                      )}
                                    </div>
                                    <p className="mt-2 font-medium">{match.homeTeam.name}</p>
                                    {match.status === 'completed' && (
                                      <p className="text-2xl font-bold">{match.homeTeam.score}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <span className="text-xl font-bold text-gray-400">VS</span>
                                  </div>
                                  
                                  <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                      {match.awayTeam.logo ? (
                                        <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 object-contain" />
                                      ) : (
                                        <span>{match.awayTeam.name.substring(0, 2)}</span>
                                      )}
                                    </div>
                                    <p className="mt-2 font-medium">{match.awayTeam.name}</p>
                                    {match.status === 'completed' && (
                                      <p className="text-2xl font-bold">{match.awayTeam.score}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-3">
                                  <p className="text-sm text-gray-600"><span className="font-medium">Stadium:</span> {match.stadium}</p>
                                  <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {formatDate(match.date)}</p>
                                  <p className="text-sm text-gray-600"><span className="font-medium">League:</span> {match.league.name}</p>
                                  <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> <StatusBadge status={match.status} /></p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="w-1/2 pl-4">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Actions</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                <Link href={`/admin/matches/${match.id}/edit`}>
                                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Match Details
                                  </button>
                                </Link>
                                
                                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  {match.status === 'completed' ? 'View Stats' : 'Update Stats'}
                                </button>
                                
                                <button className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${match.featured ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  {match.featured ? 'Remove from Featured' : 'Add to Featured'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Bulk Actions</h2>
          <div className="space-x-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              Export Matches
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
              Import Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

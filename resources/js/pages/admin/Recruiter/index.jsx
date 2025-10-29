// import React, { useState } from 'react';
// import AppLayout from '@/layouts/app-layout';
// import { Head, usePage } from '@inertiajs/react';
// import { Users, Search, Filter, Briefcase, ClipboardCheck, FileText, CheckCircle, Award, Mail, ChevronsRight, ChevronsLeft } from 'lucide-react';

// export default function RecruiterDashboard() {
//   const { users } = usePage().props; 
//   const stages = [
//     { name: 'Applied', icon: FileText },
//     { name: 'Screening', icon: Search },
//     { name: 'Interview', icon: Users },
//     { name: 'Assessment', icon: ClipboardCheck },
//     { name: 'Offer', icon: Award },
//     { name: 'Hired', icon: CheckCircle }
//   ];
 
//   const [candidates, setCandidates] = useState(
//     users.map((user) => ({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       position: user.role,
//       stage: 'Applied',
//       experience: 'N/A',
//       location: 'Unknown',
//       date: '2025-10-27'
//     }))
//   );

//   const [selectedCandidates, setSelectedCandidates] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStage, setFilterStage] = useState('All');
//     const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const toggleCandidate = (id) => {
//     setSelectedCandidates(prev =>
//       prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
//     );
//   };

//   const moveToStage = (newStage) => {
//     setCandidates(prev =>
//       prev.map(candidate =>
//         selectedCandidates.includes(candidate.id)
//           ? { ...candidate, stage: newStage }
//           : candidate
//       )
//     );
//     setSelectedCandidates([]);
//   };

//   const filteredCandidates = candidates.filter(candidate => {
//     const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
//       || candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
//       || candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStage = filterStage === 'All' || candidate.stage === filterStage;
//     return matchesSearch && matchesStage;
//   });

// const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
//   const displayedCandidates = filteredCandidates.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const getCandidatesByStage = (stage) => candidates.filter(c => c.stage === stage).length;

//   return (
//     <AppLayout>
//       <Head title="Recruiter" />
//       <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0d0d0d] transition-colors duration-300">
//         <div className="max-w-7xl mx-auto">
          
//           {/* Header */}
//           <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 mb-8 border-t-4 border-yellow-400">
//             <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-4 rounded-2xl shadow-lg">
//                   <Briefcase className="w-10 h-10 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
//                     Talent Pipeline
//                   </h1>
//                   <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your candidates</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-6">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-yellow-600">{candidates.length}</div>
//                   <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
//                 </div>
//                 <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-amber-600">{selectedCandidates.length}</div>
//                   <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Selected</div>
//                 </div>
//               </div>
//             </div>

//             {/* Stage Overview */}
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//               {stages.map((stage) => {
//                 const Icon = stage.icon;
//                 const count = getCandidatesByStage(stage.name);
//                 return (
//                   <div
//                     key={stage.name}
//                     className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-[#1a1a1a] dark:to-[#1a1a1a] rounded-2xl p-5 border-2 border-yellow-200 dark:border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="bg-yellow-400 p-2 rounded-lg">
//                         <Icon className="w-5 h-5 text-white" />
//                       </div>
//                       <div className="text-3xl font-bold text-yellow-600">{count}</div>
//                     </div>
//                     <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stage.name}</div>
//                     <div className="mt-2 bg-yellow-200 dark:bg-gray-700 rounded-full h-1.5">
//                       <div
//                         className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
//                         style={{ width: `${(count / candidates.length) * 100}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Search and Filter */}
//           <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl p-6 mb-6">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
//                 <input
//                   type="text"
//                   placeholder="Search by name, email, or role"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-4 border-2 border-yellow-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-200 focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 transition-all"
//                 />
//               </div>
//               <div className="relative">
//                 <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
//                 <select
//                   value={filterStage}
//                   onChange={(e) => setFilterStage(e.target.value)}
//                   className="w-full pl-12 pr-4 py-4 border-2 border-yellow-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-200 focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 transition-all appearance-none"
//                 >
//                   <option value="All">All Stages</option>
//                   {stages.map(stage => (
//                     <option key={stage.name} value={stage.name}>{stage.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Candidates List */}
//            <div className="space-y-4 ">
//             {displayedCandidates.map(candidate => {
//               const isSelected = selectedCandidates.includes(candidate.id);
//               return (
//                 <div
//                   key={candidate.id}
//                   onClick={() => toggleCandidate(candidate.id)}
//                   className={`bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg transition-all cursor-pointer border-2 ${
//                     isSelected
//                       ? 'border-yellow-400 shadow-yellow-200 shadow-2xl scale-[1.02]'
//                       : 'border-transparent hover:border-yellow-200 dark:hover:border-yellow-500 hover:shadow-xl'
//                   }`}
//                 >
//                   <div className="flex items-start gap-6">
//                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300 dark:border-gray-600'}`}>
//                       {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
//                     </div>
//                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
//                       {candidate.name.split(' ').map(n => n[0]).join('')}
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{candidate.name}</h3>
//                       <p className="text-amber-600 dark:text-yellow-400 font-semibold mb-2">{candidate.position}</p>
//                       <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
//                         <Mail className="w-4 h-4 text-yellow-500" /> {candidate.email}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-center mt-6 mb-6 gap-2">
//           {/* Pagination */}
//             <div className="flex gap-5 mt-10 w-full items-center justify-center">
//                 <button
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage((prev) => prev - 1)}
//                     className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer"
//                 >
//                     <ChevronsLeft />
//                 </button>

//                 <span>
//                     Page {currentPage} of {totalPages}
//                 </span>

//                 <button
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage((prev) => prev + 1)}
//                     className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer"
//                 >
//                     <ChevronsRight />
//                 </button>
//             </div>
// </div>

//     </AppLayout>
//   );
// }

'use strict';

const mongoose = require('mongoose');
const FacultyLink = require('../models/FacultyLink.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/tmp_db';

const FACULTY_DATA = [
  {
    name: 'Dr. R. Praveen Sam',
    designation: 'Professor & HoD',
    qualifications: 'Ph.D',
    researchInterest: 'Computer Networks',
    googleScholar: 'https://scholar.google.com/citations?user=FD6V7QEAAAAJ&hl=en&oi=ao',
    apaarId: '811167259826',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/241362',
    email: 'hodcsm@gprec.ac.in',
    isGuest: false,
    order: 0
  },
  {
    name: 'Dr. K.Govardhan Reddy',
    designation: 'Professor & Dean',
    qualifications: 'Ph.D',
    researchInterest: 'Wireless Communications',
    googleScholar: 'https://scholar.google.com/citations?user=6i3HjgkAAAAJ&hl=en&authuser=1',
    apaarId: '403373628290',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/241036',
    email: 'govardhan.csm@gprec.ac.in',
    isGuest: false,
    order: 1
  },
  {
    name: 'Dr.G. Raghu Ram',
    designation: 'Professor',
    qualifications: 'MCA., Ph.D',
    researchInterest: 'DataMining',
    googleScholar: 'https://scholar.google.com/citations?user=ohP4vqkAAAAJ&hl=en',
    apaarId: '325463924071',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/242106',
    email: '',
    isGuest: false,
    order: 2
  },
  {
    name: 'Dr. K.Srinivasa Rao',
    designation: 'Professor',
    qualifications: 'M.Tech.,Ph.D',
    researchInterest: 'Data Mining',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=TwAX7QQAAAAJ',
    apaarId: '631497634635',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/630566',
    email: '',
    isGuest: false,
    order: 3
  },
  {
    name: 'Dr. Y.Rama Mohan',
    designation: 'Assoc.Prof & Assoc.HOD',
    qualifications: 'M.Tech.,Ph.D',
    researchInterest: 'Fiber optic Networks',
    googleScholar: 'https://scholar.google.co.in/citations?user=36aTSUsAAAAJ&hl=en',
    apaarId: '243125366806',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/515649',
    email: 'yrm.csm@gprec.ac.in',
    isGuest: false,
    order: 4
  },
  {
    name: 'Dr. A.Vishnuvardhan Reddy',
    designation: 'Associate Professor',
    qualifications: 'M.Tech.,Ph.D',
    researchInterest: 'Data Warehousing, Image Processing',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=dAl3yP0AAAAJ',
    apaarId: '130032809471',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/580099',
    email: '',
    isGuest: false,
    order: 5
  },
  {
    name: 'Dr. K.Srikanth',
    designation: 'Associate Professor',
    qualifications: 'M.Tech, Ph.D.',
    researchInterest: 'DataMining',
    googleScholar: 'https://scholar.google.com/citations?user=gDiZ3O8AAAAJ&hl=en&authuser=1',
    apaarId: '441851791233',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/512806',
    email: '',
    isGuest: false,
    order: 6
  },
  {
    name: 'Dr. Abid Nayeemuddin.M',
    designation: 'Associate Professor',
    qualifications: 'M.Tech., Ph.D',
    researchInterest: 'Data Science and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=G23NoHEAAAAJ&hl=en',
    apaarId: '894870812172',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/690256',
    email: '',
    isGuest: false,
    order: 7
  },
  {
    name: 'Sri. P.Madhusudan',
    designation: 'Associate Professor for Practice',
    qualifications: 'M.C.A,(Ph.D)',
    researchInterest: 'Data Science and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=PqIC_BkAAAAJ',
    apaarId: '273046422144',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591242',
    email: '',
    isGuest: false,
    order: 8
  },
  {
    name: 'Dr.M.Jahir Pasha',
    designation: 'Associate Professor',
    qualifications: 'M.Tech,Ph.D',
    researchInterest: 'Data Analytics and Software Engineering',
    googleScholar: 'https://scholar.google.com/citations?user=oWZEaJIAAAAJ',
    apaarId: '466835067553',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/449840',
    email: '',
    isGuest: false,
    order: 9
  },
  {
    name: 'Dr D Jayanarayana Reddy',
    designation: 'Associate Professor',
    qualifications: 'M.Tech,Ph.D',
    researchInterest: 'Machine Learning and Deep Learning',
    googleScholar: 'https://scholar.google.com/citations?user=bcYJOKAAAAAJ&hl=en',
    apaarId: '783322517512',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/630151',
    email: '',
    isGuest: false,
    order: 10
  },
  {
    name: 'Dr.J.Siva Ramakrishna',
    designation: 'Associate Professor',
    qualifications: 'M.E.,Ph.D',
    researchInterest: 'AI & ML, Data Science, Computer Vision, Gen AI',
    googleScholar: 'https://scholar.google.com/citations?user=P7l0TlkAAAAJ&hl=en',
    apaarId: '950088047777',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/231174',
    email: '',
    isGuest: false,
    order: 11
  },
  {
    name: 'Sri. P.N.V.S.Pavan Kumar',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech., (Ph.D)',
    researchInterest: 'Bigdata, Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=jquSiA4AAAAJ&hl=en&authuser=1',
    apaarId: '825529254981',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/515854',
    email: '',
    isGuest: false,
    order: 12
  },
  {
    name: 'Smt. K.Asha Rani',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Bigdata ,Cloud Computing',
    googleScholar: 'https://scholar.google.co.in/citations?user=ie66ayYAAAAJ&hl=en&authuser=1',
    apaarId: '284236128606',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591005',
    email: '',
    isGuest: false,
    order: 13
  },
  {
    name: 'Sri. S. Vinay Kumar',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech., (Ph.D)',
    researchInterest: 'Cloud Computing',
    googleScholar: 'https://scholar.google.co.in/citations?user=YmTqh1QAAAAJ&hl=en',
    apaarId: '595354530633',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/241860',
    email: '',
    isGuest: false,
    order: 14
  },
  {
    name: 'Sri. V.Suresh',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech., (Ph.D)',
    researchInterest: 'Software Engineering',
    googleScholar: 'https://scholar.google.com/citations?user=niOnPckAAAAJ&hl=en',
    apaarId: '403685029670',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/241274',
    email: '',
    isGuest: false,
    order: 15
  },
  {
    name: 'Smt. O.Roopa Devi',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech., (Ph.D)',
    researchInterest: 'Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=TGWbtbgAAAAJ&hl=en',
    apaarId: '450859788499',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591008',
    email: '',
    isGuest: false,
    order: 16
  },
  {
    name: 'Smt.O.Sirisha',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Computer Science',
    googleScholar: 'https://scholar.google.com/citations?user=IvNJyQsAAAAJ&hl=en',
    apaarId: '318059225813',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591266',
    email: '',
    isGuest: false,
    order: 17
  },
  {
    name: 'Smt. S.Shashikala',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech.,(Ph.D)',
    researchInterest: 'Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=QtkiFNAAAAAJ&scilu=',
    apaarId: '572399831857',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591271',
    email: '',
    isGuest: false,
    order: 18
  },
  {
    name: 'Smt. G.Alekhya',
    designation: 'Assistant Professor',
    qualifications: 'B.Tech(CSE).,MBA',
    researchInterest: 'Finance',
    googleScholar: 'https://scholar.google.com/citations?user=y1BoDqMAAAAJ&hl=en',
    apaarId: '137444557906',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/691259',
    email: '',
    isGuest: false,
    order: 19
  },
  {
    name: 'Smt. B. Varalakshmi',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech., MBA,(Ph.D)',
    researchInterest: 'Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=2M6Sw84AAAAJ&hl=en',
    apaarId: '604470450779',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/515198',
    email: '',
    isGuest: false,
    order: 20
  },
  {
    name: 'Smt. T.Chandana',
    designation: 'Assistant Professor',
    qualifications: 'B.Com., MBA',
    researchInterest: 'Finance & HR',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=xwOOwpUAAAAJ',
    apaarId: '658422396221',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591285',
    email: '',
    isGuest: false,
    order: 21
  },
  {
    name: 'Dr. S. Shabana Begum',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech.,Ph.D',
    researchInterest: 'Data Science',
    googleScholar: 'https://scholar.google.com/citations?user=oSs0A0MAAAAJ&hl=en',
    apaarId: '469124929491',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/590988',
    email: '',
    isGuest: false,
    order: 22
  },
  {
    name: 'Sri. M. Mahesh Kumar',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech,(Ph.D)',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=FFV0Iu0AAAAJ&hl=en',
    apaarId: '945678462261',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/590987',
    email: '',
    isGuest: false,
    order: 23
  },
  {
    name: 'Ms. V.Jemima Jyothi',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=1uHUwzUAAAAJ&hl=en',
    apaarId: '583982247045',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/590989',
    email: '',
    isGuest: false,
    order: 24
  },
  {
    name: 'Sri. Syed Mohammed Nadeem',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=jIL81OoAAAAJ&hl=en',
    apaarId: '773817194157',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591034',
    email: '',
    isGuest: false,
    order: 25
  },
  {
    name: 'Smt. M.Manasa',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech,(Ph.D)',
    researchInterest: 'Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=A89PJZsAAAAJ&hl=en',
    apaarId: '929808283011',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/511730',
    email: '',
    isGuest: false,
    order: 26
  },
  {
    name: 'Smt. B.Kiranmayee',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech,(Ph.D)',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=RlZEOoAAAAAJ&hl=en',
    apaarId: '233304850962',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591053',
    email: '',
    isGuest: false,
    order: 27
  },
  {
    name: 'Sri. G.K. Nagaraju',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=nIAb8JcAAAAJ&hl=en',
    apaarId: '435178383162',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591032',
    email: '',
    isGuest: false,
    order: 28
  },
  {
    name: 'Smt. D. Sai Brunda',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech,(Ph.D)',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=DCNIV-IAAAAJ&authuser=4&s',
    apaarId: '897086541799',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591013',
    email: '',
    isGuest: false,
    order: 29
  },
  {
    name: 'Sri. Y Shiva Kumar',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech,(Ph.D)',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=p4vLIgEAAAAJ&hl=en',
    apaarId: '112704962110',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591012',
    email: '',
    isGuest: false,
    order: 30
  },
  {
    name: 'Sri.B.Sreedhar',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech, (Ph.D)',
    researchInterest: 'Cloud Computing, Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=rsJWeVcAAAAJ&hl=en',
    apaarId: '961517657713',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/456970',
    email: '',
    isGuest: false,
    order: 31
  },
  {
    name: 'Sri U.U.Veerendra',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Cloud and BigData',
    googleScholar: 'https://scholar.google.com/citations?user=XDk2sC8AAAAJ',
    apaarId: '756012996342',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/591176',
    email: '',
    isGuest: false,
    order: 32
  },
  {
    name: 'Sri G Shashidhar Yadav',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?user=TXsKzOQAAAAJ&hl=en',
    apaarId: '502928467337',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/593184',
    email: '',
    isGuest: false,
    order: 33
  },
  {
    name: 'Sri MD Fayaz',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.co.in/citations?view_op=list_works&hl=en&user=eSJ53BMAAAAJ&gmla',
    apaarId: '787223505827',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/597293',
    email: '',
    isGuest: false,
    order: 34
  },
  {
    name: 'Dr. A.Thammi Reddy',
    designation: 'Assistant professor',
    qualifications: 'MCA., Ph.D',
    researchInterest: 'Computer Networks',
    googleScholar: 'https://scholar.google.com/citations?user=ykssSaUAAAAJ&hl=en',
    apaarId: '580538199099',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/242458',
    email: '',
    isGuest: false,
    order: 35
  },
  {
    name: 'Smt. A. Archana',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech.',
    researchInterest: 'Computer Networks and Artificial Intelligence',
    googleScholar: 'https://scholar.google.com/citations?user=IRPQcvwAAAAJ&hl=en',
    apaarId: '490533976943',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/628246',
    email: '',
    isGuest: false,
    order: 36
  },
  {
    name: 'Smt.V Monica',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech.',
    researchInterest: 'Data Science and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=vtRZ6ywAAAAJ&scilu=&scisig=',
    apaarId: '981903464576',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/630479',
    email: '',
    isGuest: false,
    order: 37
  },
  {
    name: 'Smt.M.Sindhuja',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech.',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=q4ioER8AAAAJ&scilu=&scisig=',
    apaarId: '222754002451',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/653793',
    email: '',
    isGuest: false,
    order: 38
  },
  {
    name: 'Smt.B.Sowjanya',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech.(Ph.D)',
    researchInterest: 'Computer Networks',
    googleScholar: 'https://scholar.google.com/citations?user=iy5O1xwAAAAJ&hl=en',
    apaarId: '839620835030',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/671137',
    email: '',
    isGuest: false,
    order: 39
  },
  {
    name: 'Smt.J Himabindu',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=jzfPcfQAAAAJ&scilu=',
    apaarId: '445694772533',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/686348',
    email: '',
    isGuest: false,
    order: 40
  },
  {
    name: 'Ms.N.Ruchitha',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=Ar9-6LgAAAAJ&scilu=&scisig=',
    apaarId: '330960568701',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/686335',
    email: '',
    isGuest: false,
    order: 41
  },
  {
    name: 'Ms.I.Priyanka',
    designation: 'Assistant Professor',
    qualifications: 'M.Tech',
    researchInterest: 'Artificial Intelligence and Machine Learning',
    googleScholar: 'https://scholar.google.com/citations?hl=en&user=LAmJA7wAAAAJ&scilu=',
    apaarId: '696696792175',
    vidwanProfile: 'https://vidwan.inflibnet.ac.in/profile/719090',
    email: '',
    isGuest: false,
    order: 42
  },
  // Guest Faculty
  {
    name: 'Sri. Siva Reddy',
    designation: 'Vice President and Head of Business Strategy',
    qualifications: 'MS, MBA, PMP',
    researchInterest: 'Marketing Research & Marketing Management',
    googleScholar: '',
    apaarId: '',
    vidwanProfile: '',
    email: 'United Technology Solutions Inc., USA',
    isGuest: true,
    order: 43
  },
  {
    name: 'Sri. Sridhar Chitraju',
    designation: 'Program Director',
    qualifications: 'CTO CoE',
    researchInterest: 'Business Strategy',
    googleScholar: '',
    apaarId: 'Masters from IIT (Bombay)',
    vidwanProfile: '',
    email: 'Kyndryl CTO CoE',
    isGuest: true,
    order: 44
  },
  {
    name: 'Dr.R.P.Jagadish Chandra Bose',
    designation: 'Principal Data Scientist',
    qualifications: 'Ph.D',
    researchInterest: 'Data Science',
    googleScholar: '',
    apaarId: '',
    vidwanProfile: '',
    email: 'Skan.AI Labs Pvt.Ltd',
    isGuest: true,
    order: 45
  },
  {
    name: 'Sri . Venkateswar Reddy Melacheruvu',
    designation: 'Chief Technology Officer',
    qualifications: 'Masters from IIT (Kanpur)',
    researchInterest: 'Emerging Technologies',
    googleScholar: '',
    apaarId: '',
    vidwanProfile: '',
    email: 'Brillium Technologies, Bangalore',
    isGuest: true,
    order: 46
  }
];

async function seed() {
  console.log('[SeedFaculty] Connecting to database...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[SeedFaculty] Connected.');

    await FacultyLink.deleteMany({});
    console.log('[SeedFaculty] Cleared existing faculty members.');

    const docs = await FacultyLink.insertMany(FACULTY_DATA);
    console.log(`[SeedFaculty] Successfully seeded ${docs.length} faculty profiles!`);
  } catch (err) {
    console.error('[SeedFaculty] Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[SeedFaculty] Disconnected.');
  }
}

seed();

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const migrations = [
  // LIB REORGANIZATION
  { type: 'file', from: 'src/lib/prisma.ts', to: 'src/lib/db/prisma.ts' },
  { type: 'file', from: 'src/lib/redis.ts', to: 'src/lib/db/redis.ts' },
  { type: 'file', from: 'src/lib/db-errors.ts', to: 'src/lib/db/db-errors.ts' },
  { type: 'file', from: 'src/lib/logger.ts', to: 'src/lib/infrastructure/logger.ts' },
  { type: 'file', from: 'src/lib/env.ts', to: 'src/lib/infrastructure/env.ts' },
  { type: 'file', from: 'src/lib/rate-limit.ts', to: 'src/lib/infrastructure/rate-limit.ts' },
  { type: 'file', from: 'src/lib/analytics.ts', to: 'src/lib/infrastructure/analytics.ts' },
  { type: 'file', from: 'src/lib/utils.ts', to: 'src/lib/utils/utils.ts' },
  { type: 'file', from: 'src/lib/clinic-utils.ts', to: 'src/lib/utils/clinic-utils.ts' },
  { type: 'file', from: 'src/lib/data-utils.ts', to: 'src/lib/utils/data-utils.ts' },
  { type: 'file', from: 'src/lib/normalizers.ts', to: 'src/lib/utils/normalizers.ts' },
  { type: 'file', from: 'src/lib/safe-json.ts', to: 'src/lib/utils/safe-json.ts' },
  { type: 'file', from: 'src/lib/slug.ts', to: 'src/lib/utils/slug.ts' },
  { type: 'file', from: 'src/lib/search-engine.ts', to: 'src/lib/search/search-engine.ts' },
  { type: 'file', from: 'src/lib/search-dictionary.ts', to: 'src/lib/search/search-dictionary.ts' },
  { type: 'file', from: 'src/lib/constants.ts', to: 'src/lib/constants/constants.ts' },
  { type: 'file', from: 'src/lib/validations.ts', to: 'src/lib/validators/validations.ts' },
  { type: 'file', from: 'src/lib/queue-operations.ts', to: 'src/lib/queue/queue-operations.ts' },
  { type: 'file', from: 'src/lib/pilot-otp.ts', to: 'src/lib/auth/pilot-otp.ts' },

  // FEATURES - COMPONENTS
  { type: 'dir', from: 'src/components/doctor', to: 'src/features/doctor/components' },
  { type: 'dir', from: 'src/components/doctors', to: 'src/features/patient/components/doctors' },
  { type: 'dir', from: 'src/components/checkout', to: 'src/features/booking/components/checkout' },
  { type: 'dir', from: 'src/components/search', to: 'src/features/search/components' },
  { type: 'dir', from: 'src/components/home', to: 'src/features/marketing/components/home' },
  { type: 'dir', from: 'src/components/trust', to: 'src/features/marketing/components/trust' },
  { type: 'dir', from: 'src/components/brand', to: 'src/features/marketing/components/brand' },

  // FEATURES - HOOKS
  { type: 'file', from: 'src/hooks/useDoctorWorkspace.ts', to: 'src/features/doctor/hooks/useDoctorWorkspace.ts' },
  { type: 'file', from: 'src/hooks/useFirebasePhoneAuth.ts', to: 'src/features/auth/hooks/useFirebasePhoneAuth.ts' },
  { type: 'file', from: 'src/hooks/useJivniAuth.ts', to: 'src/features/auth/hooks/useJivniAuth.ts' },

  // FEATURES - SERVICES
  { type: 'file', from: 'src/services/authService.ts', to: 'src/features/auth/services/authService.ts' },
  { type: 'file', from: 'src/services/queueService.ts', to: 'src/features/queue/services/queueService.ts' },

  // FEATURES - STORE
  { type: 'file', from: 'src/store/useAuthStore.ts', to: 'src/features/auth/store/useAuthStore.ts' },
  { type: 'file', from: 'src/store/useBookingStore.ts', to: 'src/features/booking/store/useBookingStore.ts' },
];

function movePaths(baseDir, item) {
  const source = path.join(baseDir, '..', item.from);
  const target = path.join(baseDir, '..', item.to);
  
  if (fs.existsSync(source)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(source, target);
    console.log(`Moved: ${item.from} -> ${item.to}`);
  } else {
    console.log(`Missing: ${item.from}`);
  }
}

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const importReplacements = migrations.map(m => {
  // convert e.g. "src/lib/prisma.ts" to "@/lib/prisma"
  let fromImport = m.from.replace(/^src\//, '@/').replace(/\.tsx?$/, '');
  let toImport = m.to.replace(/^src\//, '@/').replace(/\.tsx?$/, '');
  
  return {
    from: fromImport,
    to: toImport,
    isDir: m.type === 'dir'
  };
});

function updateImportsInFiles() {
  const files = getFiles(srcDir);
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    for (const r of importReplacements) {
      if (r.isDir) {
        // match "@/components/doctor/..." -> "@/features/doctor/components/..."
        const regex1 = new RegExp(`['"]${r.from}/`, 'g');
        const regex2 = new RegExp(`['"]${r.from}['"]`, 'g');
        
        content = content.replace(regex1, (match) => match[0] + r.to + '/');
        content = content.replace(regex2, (match) => match[0] + r.to + match[match.length-1]);
      } else {
        // match exact file
        const regex1 = new RegExp(`['"]${r.from}['"]`, 'g');
        content = content.replace(regex1, (match) => match[0] + r.to + match[match.length-1]);
      }
    }

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Updated imports in: ${file}`);
    }
  }
}

console.log('--- Moving Files ---');
migrations.forEach(m => movePaths(srcDir, m));

console.log('--- Updating Imports ---');
updateImportsInFiles();

console.log('Done.');

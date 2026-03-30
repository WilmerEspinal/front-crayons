const fs = require('fs');
const file = 'src/view/public/Home.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Top bar font weight
content = content.replace(
  'text-[10px] font-bold tracking-[0.15em] uppercase',
  'text-[10px] font-medium tracking-[0.1em] uppercase'
);

// 2. Header padding and height
content = content.replace(
  'bg-white py-4 md:py-6',
  'bg-white py-3 md:py-4'
);
content = content.replace(
  'min-h-[3rem]',
  'h-12 md:h-14'
);

// 3. Logo size
content = content.replace(
  '${scrolled ? "h-8 md:h-10" : "h-10 md:h-12"}',
  '${scrolled ? "h-7 md:h-8" : "h-8 md:h-10"}'
);

// 4. Desktop Nav items font weight
content = content.replace(
  'text-[11px] font-black uppercase tracking-[0.1em]',
  'text-[11px] font-semibold uppercase tracking-wider'
);

// 5. Desktop Buttons font weight and padding
content = content.replace(
  'px-6 py-2.5 rounded-full text-[10px] font-black',
  'px-5 py-2 rounded-full text-[11px] font-medium'
);
content = content.replace(
  'px-6 py-2.5 rounded-full text-[10px] font-black',
  'px-5 py-2 rounded-full text-[11px] font-medium'
);

// 6. Mobile menu category headers
content = content.replace(
  'text-[10px] font-black uppercase tracking-[0.2em] text-orange-500',
  'text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-500'
);

// 7. Mobile menu items font weight
content = content.replace(
  'text-lg font-medium text-slate-700',
  'text-base font-medium text-slate-600'
);

// 8. Mobile menu buttons
content = content.replace(
  'py-4 rounded-full text-xs font-black uppercase',
  'py-3 rounded-full text-xs font-semibold uppercase'
);
content = content.replace(
  'py-4 rounded-full text-xs font-black uppercase',
  'py-3 rounded-full text-xs font-semibold uppercase'
);

fs.writeFileSync(file, content);
console.log('Navbar updated successfully.');

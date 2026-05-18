const db = require('./config/db');
const bcrypt = require('bcryptjs');

const creators = [
    { first: 'Arun', last: 'Maini', email: 'mrwtb@binge.com', channel: 'Mrwhosetheboss', bio: 'Making the most fun and useful tech videos on the planet', country: 'UK' },
    { first: 'Cory', last: 'Williams', email: 'cory@binge.com', channel: 'CoryxKenshin', bio: 'Gaming videos with the biggest smile on YouTube', country: 'USA' },
    { first: 'Kendrick', last: 'Lamar', email: 'kendrick@binge.com', channel: 'KendrickLamarVEVO', bio: 'Official Kendrick Lamar music videos and content', country: 'USA' },
    { first: 'Mooro', last: 'Tampad', email: 'tampad@binge.com', channel: 'Tampad', bio: 'Best sports moments and football highlights', country: 'UK' },
    { first: 'Ajey', last: 'Nagar', email: 'carry@binge.com', channel: 'CarryMinati', bio: 'Roasts, gaming and entertainment from India', country: 'India' },
    { first: 'Hassan', last: 'Junejo', email: 'junejo@binge.com', channel: 'Hassan Junejo', bio: 'Pakistani lifestyle vlogs and travel content', country: 'Pakistan' },
    { first: 'Harry', last: 'Bhai', email: 'harry@binge.com', channel: 'CodeWithHarry', bio: 'Programming tutorials in Hindi and English', country: 'India' },
];

const videoData = [
    // Mrwhosetheboss — Technology (cat 1)
    { title: 'The Mr.Beast MEGA-STUDIO Tour.', url: 'https://www.youtube.com/watch?v=lUzpK0tGFcE', duration: 1456, category: 1, views: 12000000 },
    { title: 'I bought the Smallest Tech in the World.', url: 'https://www.youtube.com/watch?v=syB1ezRvKpU', duration: 743, category: 1, views: 9800000 },
    { title: 'I bought every Playstation ever.', url: 'https://www.youtube.com/watch?v=0rCbfsuKdYw', duration: 987, category: 1, views: 7600000 },
    { title: 'I bought the THINNEST Tech of the world', url: 'https://www.youtube.com/watch?v=nmY2kgWYwyQ', duration: 1102, category: 1, views: 14000000 },
    { title: 'How this wallpaper Kills your Phone', url: 'https://www.youtube.com/watch?v=iXKvwPjCGnY', duration: 1345, category: 1, views: 11000000 },
    { title: 'Turn your Smartphone into a 3D Hologram', url: 'https://www.youtube.com/watch?v=7YWTtCsvgvg', duration: 876, category: 1, views: 8900000 },
    { title: 'I bought the most FUTURISTIC Tech of the world', url: 'https://www.youtube.com/watch?v=b0HfmY64eSE', duration: 1234, category: 1, views: 16000000 },
    { title: '21 Horrific Tech Failures they want you to Forget.', url: 'https://www.youtube.com/watch?v=QMWlRWnAZH8', duration: 1567, category: 1, views: 13000000 },
    { title: 'I bought the most Satisfying Tech of the world', url: 'https://www.youtube.com/watch?v=0BR-HgA3mlo', duration: 923, category: 1, views: 10000000 },
    { title: 'I bought the Biggest Tech of the world', url: 'https://www.youtube.com/watch?v=VuG4BcghOSg', duration: 834, category: 1, views: 6700000 },

    // CoryxKenshin — Gaming (cat 3)
    { title: 'THIS MAN IS FOLLOWING ME - CLOSING SHIFT', url: 'https://www.youtube.com/watch?v=7KAcyc9aEvg', duration: 1823, category: 3, views: 18000000 },
    { title: 'SCREAMING AT A SCARY TOY FACTORY - POPPY PLAYTIME', url: 'https://www.youtube.com/watch?v=8J_zM1zYsHg', duration: 1456, category: 3, views: 9800000 },
    { title: 'WORST JUMPSCARE IN YEARS - FEARS TO FATHOM', url: 'https://www.youtube.com/watch?v=fgMqIlgXlyI&pp=0gcJCQQLAYcqIYzv', duration: 2100, category: 3, views: 21000000 },
    { title: 'THIS GAME IS FOR KIDS?? - AMANDA THE ADVENTURE', url: 'https://www.youtube.com/watch?v=tiOrbqx62O4', duration: 2341, category: 3, views: 14000000 },
    { title: 'I GOT JUMP BY THE JOY GANG - DARK DECEPTION', url: 'https://www.youtube.com/watch?v=VP6BESB8ZAQ', duration: 1678, category: 3, views: 11000000 },
    { title: 'MY PYSCHO EX-GIRLFRIEND WANTS ME DEAD - CRIMSON SNOW', url: 'https://www.youtube.com/watch?v=Cd7HxTIZHy8', duration: 1234, category: 3, views: 16000000 },
    { title: 'SCARIED SUMMER JOB EVER - THE BATHHOUSE', url: 'https://www.youtube.com/watch?v=7st6VbU7PoY', duration: 3456, category: 3, views: 8900000 },
    { title: 'CHOO-CHOO CHARLES WHY DID I DOWNLOAD THIS GAME', url: 'https://www.youtube.com/watch?v=oxDhb6q9qmM', duration: 2890, category: 3, views: 12000000 },
    { title: 'THE MOST DISRESPECTFUL JUMPSCARE EVER', url: 'https://www.youtube.com/watch?v=KZHmKPpWg2E', duration: 1876, category: 3, views: 7600000 },
    { title: 'CRAB GAME HAVE ME IN TEARS', url: 'https://www.youtube.com/watch?v=tq5QOPi-v1U', duration: 2567, category: 3, views: 9200000 },

    // KendrickLamarVEVO — Music (cat 4)
    { title: 'Kendrick Lamar — HUMBLE (Official Video)', url: 'https://www.youtube.com/watch?v=tvTRZJ-4EyI', duration: 214, category: 4, views: 800000000 },
    { title: 'Kendrick Lamar — DNA (Official Video)', url: 'https://www.youtube.com/watch?v=NLZRYQMLDW4&pp=0gcJCQQLAYcqIYzv', duration: 205, category: 4, views: 450000000 },
    { title: 'Kendrick Lamar — Not Like Us (Official Video)', url: 'https://www.youtube.com/watch?v=T6eK-2OQtew', duration: 274, category: 4, views: 350000000 },
    { title: 'Kendrick Lamar — Swimming Pools Drank', url: 'https://www.youtube.com/watch?v=B5YNiCfWC3A', duration: 321, category: 4, views: 280000000 },
    { title: 'Kendrick Lamar — Alright (Official Video)', url: 'https://www.youtube.com/watch?v=Z-48u_uWMHY', duration: 248, category: 4, views: 190000000 },
    { title: 'Kendrick Lamar — LOYALTY ft Rihanna', url: 'https://www.youtube.com/watch?v=Dlh-dzB2U4Y', duration: 223, category: 4, views: 520000000 },
    { title: 'Kendrick Lamar — King Kunta', url: 'https://www.youtube.com/watch?v=hRK7PVJFbS8', duration: 234, category: 4, views: 180000000 },
    { title: 'Kendrick Lamar — LOVE ft Zacari', url: 'https://www.youtube.com/watch?v=ox7RsX1Ee34&pp=0gcJCQQLAYcqIYzv', duration: 215, category: 4, views: 310000000 },
    { title: 'Kendrick Lamar, SZA — All the Stars', url: 'https://www.youtube.com/watch?v=JQbjS0_ZfJ0', duration: 267, category: 4, views: 120000000 },
    { title: 'Kendrick Lamar — N95 (Official Video)', url: 'https://www.youtube.com/watch?v=zI383uEwA6Q', duration: 256, category: 4, views: 95000000 },

    // Tampad — Sports (cat 6)
    { title: 'AUSTRALIA VS PAKISTAN | 3rd ODI', url: 'https://www.youtube.com/watch?v=QmbuF1-j0wQ', duration: 1876, category: 6, views: 8900000 },
    { title: 'AUSTRALIA VS PAKISTAN | 2nd ODI', url: 'https://www.youtube.com/watch?v=-RdOEjdH3g8', duration: 2341, category: 6, views: 12000000 },
    { title: 'WEST INDIES VS PAKISTAN | 1st ODI', url: 'https://www.youtube.com/watch?v=pE0QwBgl-LM', duration: 1456, category: 6, views: 14000000 },
    { title: 'INDIA VS ENGLAND | 5th T20i', url: 'https://www.youtube.com/watch?v=r1VgelUBUiE', duration: 1234, category: 6, views: 7600000 },
    { title: 'WEST INDIES VS PAKISTAN | 3rd T20i', url: 'https://www.youtube.com/watch?v=o46Tk47_O40', duration: 987, category: 6, views: 9800000 },
    { title: 'INDIA VS SOUTH AFRICA | 2nd ODI', url: 'https://www.youtube.com/watch?v=bGz-L9D4oaE', duration: 1678, category: 6, views: 11000000 },
    { title: 'NEW ZEALAND VS INDIA | 3rd ODI', url: 'https://www.youtube.com/watch?v=KNRQCSriq8o', duration: 2100, category: 6, views: 16000000 },
    { title: 'BANGLADESH VS WEST INDIES | 1st ODI', url: 'https://www.youtube.com/watch?v=oxokic7ihEY', duration: 1345, category: 6, views: 6700000 },
    { title: 'AUSTRALIA VS INDIA | 2nd T20i', url: 'https://www.youtube.com/watch?v=MkismjsCSp8', duration: 1102, category: 6, views: 8100000 },
    { title: 'BANGLADESH VS PAKISTAN | 1st T20i', url: 'https://www.youtube.com/watch?v=NF_PG6xI8RA', duration: 1567, category: 6, views: 5600000 },

    // CarryMinati — Comedy (cat 7)
    { title: 'MR BEAST PARODY', url: 'https://www.youtube.com/watch?v=m9s1NQG3TNY', duration: 1234, category: 7, views: 160000000 },
    { title: 'DAILY VOLGERS PARODY', url: 'https://www.youtube.com/watch?v=5XVoRGhrhZk', duration: 267, category: 7, views: 130000000 },
    { title: 'BIG BOSS BIG BOSS BIG BOSS | ROAST ', url: 'https://www.youtube.com/watch?v=9DAKh_XCk6g', duration: 987, category: 7, views: 45000000 },
    { title: 'THARA BHAIIIIIIIII', url: 'https://www.youtube.com/watch?v=0jUj3rfO7eM', duration: 654, category: 7, views: 38000000 },
    { title: 'VADA PAV AUR CHAI', url: 'https://www.youtube.com/watch?v=WX7DBPcsiEs', duration: 1102, category: 7, views: 52000000 },
    { title: 'FLIM THE FLARE', url: 'https://www.youtube.com/watch?v=GOFQN8otiYs', duration: 876, category: 7, views: 29000000 },
    { title: 'INDIAN FOOD MAGIC', url: 'https://www.youtube.com/watch?v=-LIMVVfRp6Q', duration: 1345, category: 7, views: 34000000 },
    { title: 'MOTIVATIONAL SPEAKER PARODY', url: 'https://www.youtube.com/watch?v=P8P_S1Fjl_Q', duration: 923, category: 7, views: 41000000 },
    { title: 'LADIKYON KE BEST FRIEND', url: 'https://www.youtube.com/watch?v=l6BChpns5w8', duration: 1456, category: 7, views: 27000000 },
    { title: 'MAGGIE KHAO BODY BANAO', url: 'https://www.youtube.com/watch?v=IoTL9xZOdP0&pp=0gcJCQQLAYcqIYzv', duration: 1678, category: 7, views: 33000000 },

    // Hassan Junejo — Vlogs (cat 5)
    { title: 'WHY I SOLD MY R1 AND GOT A CAR', url: 'https://www.youtube.com/watch?v=xahHKydYlO4', duration: 2341, category: 5, views: 8900000 },
    { title: 'MY NEW car... is not A CAR!', url: 'https://www.youtube.com/watch?v=rnBMXZbg6Qc', duration: 1876, category: 5, views: 6700000 },
    { title: 'MISSION BABY BULL', url: 'https://www.youtube.com/watch?v=_GUu4ZWw8mg', duration: 2100, category: 5, views: 5400000 },
    { title: 'CHEAT DAY in Broadway', url: 'https://www.youtube.com/watch?v=Vjf5FsjiL70', duration: 3241, category: 5, views: 7800000 },
    { title: 'BABAR AZAM in BIRMINGHAM', url: 'https://www.youtube.com/watch?v=1eaWkcvlaaE', duration: 1456, category: 5, views: 4300000 },
    { title: 'THE STORY OF KARACHI BURGER', url: 'https://www.youtube.com/watch?v=XDSdyeenSgw', duration: 1823, category: 5, views: 5100000 },
    { title: 'LONDON KE SHER', url: 'https://www.youtube.com/watch?v=L0C9zh9k5yM', duration: 1987, category: 5, views: 3800000 },
    { title: '21 DAYS without SUGAR', url: 'https://www.youtube.com/watch?v=Zu-_UdbkXUU&pp=0gcJCQQLAYcqIYzv', duration: 1234, category: 5, views: 4600000 },
    { title: 'SMART DIRECTOR BOY', url: 'https://www.youtube.com/watch?v=l5kzn4Fs0x4', duration: 2567, category: 5, views: 6200000 },
    { title: 'WHEN TO ACT ON IDEAS', url: 'https://www.youtube.com/watch?v=TFij6In-6MU', duration: 1678, category: 5, views: 9100000 },

    // CodeWithHarry — Education (cat 2)
    { title: 'Python tutorial for beginners in Hindi', url: 'https://www.youtube.com/watch?v=gfDE2a7MKjA', duration: 14400, category: 2, views: 12000000 },
    { title: 'Web development full course — Hindi', url: 'https://www.youtube.com/watch?v=6mbwJ2xhgzM', duration: 18000, category: 2, views: 8900000 },
    { title: 'Java tutorial for beginners — Complete course', url: 'https://www.youtube.com/watch?v=ntLJmHOJ0ME', duration: 16200, category: 2, views: 6700000 },
    { title: 'How to become a full stack developer in 2024', url: 'https://www.youtube.com/watch?v=ysEN5RaKOlA', duration: 2341, category: 2, views: 5400000 },
    { title: 'Django tutorial for beginners — Build a website', url: 'https://www.youtube.com/watch?v=T1intZyhXDU', duration: 7200, category: 2, views: 4300000 },
    { title: 'C++ full course for beginners — Hindi', url: 'https://www.youtube.com/watch?v=j8nAHeVKL08', duration: 21600, category: 2, views: 7800000 },
    { title: 'JavaScript course in Hindi — Sigma batch', url: 'https://www.youtube.com/watch?v=chx9Rs41W6g', duration: 10800, category: 2, views: 9200000 },
    { title: 'Data structures and algorithms in Python', url: 'https://www.youtube.com/watch?v=pkYVOmU3MgA', duration: 9000, category: 2, views: 3800000 },
    { title: 'Learing Coding and Getting a JOB in 2026', url: 'https://www.youtube.com/watch?v=YBB3GbluHjA', duration: 1876, category: 2, views: 2900000 },
    { title: 'MySQL complete tutorial for beginners', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', duration: 3600, category: 2, views: 5100000 },
];

async function seed() {
    console.log('🌱 Starting seed...');
    const password = bcrypt.hashSync('password123', 10);

    for (let i = 0; i < creators.length; i++) {
        const c = creators[i];

        await new Promise((resolve, reject) => {
            db.query(
                `INSERT IGNORE INTO user (FirstName, LastName, Email, Password, Country, Status)
                 VALUES (?, ?, ?, ?, ?, 'Active')`,
                [c.first, c.last, c.email, password, c.country],
                (err, result) => err ? reject(err) : resolve(result)
            );
        });

        const userRow = await new Promise((resolve, reject) => {
            db.query('SELECT Id FROM user WHERE Email = ?', [c.email],
                (err, result) => err ? reject(err) : resolve(result[0])
            );
        });

        await new Promise((resolve, reject) => {
            db.query(
                `INSERT IGNORE INTO creator (UserId, ChannelName, Bio, TotalSubscribers, TotalViews)
                 VALUES (?, ?, ?, ?, 0)`,
                [userRow.Id, c.channel, c.bio, Math.floor(Math.random() * 20000000) + 1000000],
                (err, result) => err ? reject(err) : resolve(result)
            );
        });

        const creatorRow = await new Promise((resolve, reject) => {
            db.query('SELECT Id FROM creator WHERE UserId = ?', [userRow.Id],
                (err, result) => err ? reject(err) : resolve(result[0])
            );
        });

        const myVideos = videoData.slice(i * 10, i * 10 + 10);
        for (const v of myVideos) {
            const videoResult = await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO video (CreatorId, CategoryId, Title, VideoUrl, Duration, Views, Status, UploadDate)
                     VALUES (?, ?, ?, ?, ?, ?, 'Published', DATE_SUB(NOW(), INTERVAL ? DAY))`,
                    [creatorRow.Id, v.category, v.title, v.url, v.duration, v.views,
                    Math.floor(Math.random() * 365) + 1],
                    (err, result) => err ? reject(err) : resolve(result)
                );
            });

            await new Promise((resolve) => {
                db.query('UPDATE creator SET TotalViews = TotalViews + ? WHERE Id = ?',
                    [v.views, creatorRow.Id], () => resolve()
                );
            });
        }
        console.log(`✅ ${c.channel} — 10 videos added`);
    }

    console.log('\n🎉 Done! 7 creators and 70 videos added.');
    process.exit();
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
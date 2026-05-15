const db = require('./config/db');
const bcrypt = require('bcryptjs');

const creators = [
  { first: 'Ahmed',   last: 'Khan',     email: 'ahmed@binge.com',   channel: 'AhmedTech',         bio: 'Tech reviews and tutorials',              country: 'Pakistan' },
  { first: 'Sara',    last: 'Ali',      email: 'sara@binge.com',    channel: 'SaraVlogs',         bio: 'Daily vlogs, food and travel',            country: 'Pakistan' },
  { first: 'Bilal',   last: 'Raza',     email: 'bilal@binge.com',   channel: 'BilalPlays',        bio: 'Gaming walkthroughs and reviews',         country: 'Pakistan' },
  { first: 'Ayesha',  last: 'Malik',    email: 'ayesha@binge.com',  channel: 'AyeshaLearn',       bio: 'Education and tech careers',              country: 'Pakistan' },
  { first: 'Usman',   last: 'Sheikh',   email: 'usman@binge.com',   channel: 'UsmanSports',       bio: 'Cricket and football analysis',           country: 'Pakistan' },
  { first: 'James',   last: 'Carter',   email: 'james@binge.com',   channel: 'JamesTechWorld',    bio: 'Gadgets, AI and software reviews',        country: 'USA' },
  { first: 'Emily',   last: 'Brooks',   email: 'emily@binge.com',   channel: 'EmilyLifestyle',    bio: 'Lifestyle, wellness and travel',          country: 'UK' },
  { first: 'Marcus',  last: 'Williams', email: 'marcus@binge.com',  channel: 'MarcusGaming',      bio: 'Pro gaming tips and reviews',             country: 'USA' },
  { first: 'Priya',   last: 'Sharma',   email: 'priya@binge.com',   channel: 'PriyaEducates',     bio: 'Programming and data science',            country: 'India' },
  { first: 'Carlos',  last: 'Mendez',   email: 'carlos@binge.com',  channel: 'CarlosSports',      bio: 'Football and NBA analysis',               country: 'USA' },
  { first: 'Zara',    last: 'Hassan',   email: 'zara@binge.com',    channel: 'ZaraMusicOfficial', bio: 'Original music and covers',               country: 'Pakistan' },
  { first: 'Tyler',   last: 'Johnson',  email: 'tyler@binge.com',   channel: 'TylerComedy',       bio: 'Skits and stand up comedy',               country: 'USA' },
  { first: 'Amir',    last: 'Siddiqui', email: 'amir@binge.com',    channel: 'AmirFunny',         bio: 'Pakistani comedy and roasts',             country: 'Pakistan' },
  { first: 'Sofia',   last: 'Martinez', email: 'sofia@binge.com',   channel: 'SofiaMusic',        bio: 'Pop covers and original songs',           country: 'USA' },
];

const videoData = [
  // AhmedTech — Technology (cat 1)
  { title: 'iPhone 16 Pro Full Review',                           url: 'https://www.youtube.com/watch?v=q2GBsaJBBFQ', duration: 847,  category: 1, views: 45200  },
  { title: 'Top 10 Laptops of 2024',                             url: 'https://www.youtube.com/watch?v=V3fFpHIBMGI', duration: 1203, category: 1, views: 32100  },
  { title: 'How to Build a Gaming PC',                           url: 'https://www.youtube.com/watch?v=PXex-mb_17w', duration: 2340, category: 1, views: 28900  },
  { title: 'Samsung S24 vs iPhone 16',                           url: 'https://www.youtube.com/watch?v=pBnxmDmqPXg', duration: 956,  category: 1, views: 61000  },
  { title: 'Best Budget Phones 2024',                            url: 'https://www.youtube.com/watch?v=CHkp_sJMOe4', duration: 734,  category: 1, views: 19800  },

  // SaraVlogs — Vlogs (cat 5)
  { title: 'Day in My Life Vlog',                                url: 'https://www.youtube.com/watch?v=7HKoqNJtMTQ', duration: 1456, category: 5, views: 23400  },
  { title: 'Best Street Food Tour',                              url: 'https://www.youtube.com/watch?v=KDpzONB2Hf4', duration: 1823, category: 5, views: 41200  },
  { title: 'Mountain Trip Travel Vlog',                          url: 'https://www.youtube.com/watch?v=7MoYYWNBNQg', duration: 2100, category: 5, views: 17600  },
  { title: 'My Productive Morning Routine',                      url: 'https://www.youtube.com/watch?v=b9440SFsxkU', duration: 892,  category: 5, views: 29800  },
  { title: 'Healthy Meal Prep for the Week',                     url: 'https://www.youtube.com/watch?v=iNFHGvPGiPw', duration: 743,  category: 5, views: 15300  },

  // BilalPlays — Gaming (cat 3)
  { title: 'GTA 5 Epic Moments Compilation',                     url: 'https://www.youtube.com/watch?v=QdBZExpgErs', duration: 1823, category: 3, views: 98400  },
  { title: 'Valorant Ace Highlights',                            url: 'https://www.youtube.com/watch?v=e_E9W2vsRbQ', duration: 1241, category: 3, views: 54300  },
  { title: 'Best Gaming Setup Tour 2024',                        url: 'https://www.youtube.com/watch?v=oaAeAhi-0-M', duration: 1102, category: 3, views: 38700  },
  { title: 'FIFA 25 Ultimate Team Guide',                        url: 'https://www.youtube.com/watch?v=qlOAbrvjMBo', duration: 1890, category: 3, views: 27600  },
  { title: 'Top 10 PC Games of 2024',                            url: 'https://www.youtube.com/watch?v=kkPNgxmAnNE', duration: 876,  category: 3, views: 44100  },

  // AyeshaLearn — Education (cat 2)
  { title: 'How to Start Freelancing',                           url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', duration: 2145, category: 2, views: 71400  },
  { title: 'Python for Beginners Full Course',                   url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: 3456, category: 2, views: 56800  },
  { title: 'SQL Database Full Course',                           url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', duration: 5400, category: 2, views: 48900  },
  { title: 'How to Get Your First Tech Job',                     url: 'https://www.youtube.com/watch?v=Reh734gzyk8', duration: 1876, category: 2, views: 39200  },
  { title: 'Web Development Roadmap 2024',                       url: 'https://www.youtube.com/watch?v=ysEN5RaKOlA', duration: 2341, category: 2, views: 33200  },

  // UsmanSports — Sports (cat 6)
  { title: 'Pakistan Cricket Best Moments',                      url: 'https://www.youtube.com/watch?v=2pjxPR36qpU', duration: 1456, category: 6, views: 187000 },
  { title: 'Babar Azam Best Centuries',                          url: 'https://www.youtube.com/watch?v=vE0dOlFGeU4', duration: 923,  category: 6, views: 93400  },
  { title: 'Champions League Best Goals',                        url: 'https://www.youtube.com/watch?v=zeBRIZfNVKU', duration: 1678, category: 6, views: 145000 },
  { title: 'Top 10 Cricket Catches Ever',                        url: 'https://www.youtube.com/watch?v=QRbMCNqtMVg', duration: 1234, category: 6, views: 67800  },
  { title: 'Fastest Centuries in Cricket History',               url: 'https://www.youtube.com/watch?v=Rz4JCNYHNIY', duration: 2100, category: 6, views: 112000 },

  // JamesTechWorld — Technology (cat 1)
  { title: 'Every AI Tool Ranked in 2024',                       url: 'https://www.youtube.com/watch?v=bSXFyFT9Jgs', duration: 1876, category: 1, views: 234000 },
  { title: 'Apple Vision Pro Honest Review',                     url: 'https://www.youtube.com/watch?v=TX9qSaGXFyg', duration: 1234, category: 1, views: 189000 },
  { title: 'Best Tech of 2024 So Far',                           url: 'https://www.youtube.com/watch?v=1ZdlAg3j8nI', duration: 2341, category: 1, views: 312000 },
  { title: 'Tesla Full Self Driving Review',                     url: 'https://www.youtube.com/watch?v=L4Gt8qIAByI', duration: 987,  category: 1, views: 445000 },
  { title: 'MacBook Pro M3 Max Review',                          url: 'https://www.youtube.com/watch?v=OAd2Al_yBkQ', duration: 1543, category: 1, views: 267000 },

  // EmilyLifestyle — Vlogs (cat 5)
  { title: 'Week in New York City Vlog',                         url: 'https://www.youtube.com/watch?v=ZP2sOFCdAkk', duration: 1823, category: 5, views: 156000 },
  { title: 'Solo Trip to Japan Full Vlog',                       url: 'https://www.youtube.com/watch?v=0u3Zd9TUiS4', duration: 3241, category: 5, views: 298000 },
  { title: 'London Apartment Tour',                              url: 'https://www.youtube.com/watch?v=VNaGCsiF4Cs', duration: 1102, category: 5, views: 87000  },
  { title: '48 Hours in Paris Vlog',                             url: 'https://www.youtube.com/watch?v=RQgBRfXhIoQ', duration: 2100, category: 5, views: 203000 },
  { title: '30 Day Digital Detox Results',                       url: 'https://www.youtube.com/watch?v=K3RuMiZGj0Q', duration: 1456, category: 5, views: 134000 },

  // MarcusGaming — Gaming (cat 3)
  { title: 'Overwatch 2 Top 500 Guide',                          url: 'https://www.youtube.com/watch?v=crln-p6M-Y4', duration: 2890, category: 3, views: 178000 },
  { title: 'Minecraft Survival Tips 2024',                       url: 'https://www.youtube.com/watch?v=w8Aa8HTJFAQ', duration: 1654, category: 3, views: 312000 },
  { title: 'Best Games of 2024 Ranked',                          url: 'https://www.youtube.com/watch?v=_n9iSFE3DnQ', duration: 1234, category: 3, views: 567000 },
  { title: 'Ultimate Gaming PC Build Guide',                     url: 'https://www.youtube.com/watch?v=K-HMIB_KAK0', duration: 1876, category: 3, views: 234000 },
  { title: 'Call of Duty All Games Ranked',                      url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU', duration: 2400, category: 3, views: 189000 },

  // PriyaEducates — Education (cat 2)
  { title: 'How I Got Hired at Google',                          url: 'https://www.youtube.com/watch?v=hsSK94kB9ak', duration: 2341, category: 2, views: 445000 },
  { title: 'Machine Learning Full Course',                       url: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ', duration: 7200, category: 2, views: 567000 },
  { title: 'React vs Next.js — Which to Learn',                  url: 'https://www.youtube.com/watch?v=T2uKprwHHXU', duration: 1456, category: 2, views: 234000 },
  { title: 'I Studied 12 Hours Daily for 30 Days',               url: 'https://www.youtube.com/watch?v=E5uYOdSfHts', duration: 1102, category: 2, views: 312000 },
  { title: 'Highest Paying Tech Jobs 2024',                      url: 'https://www.youtube.com/watch?v=9GXMVTzFjp4', duration: 987,  category: 2, views: 389000 },

  // CarlosSports — Sports (cat 6)
  { title: 'World Cup 2026 Best Goals',                          url: 'https://www.youtube.com/watch?v=KXa_Os7STeA', duration: 3456, category: 6, views: 789000 },
  { title: 'LeBron vs Jordan GOAT Debate',                       url: 'https://www.youtube.com/watch?v=JNNzKwDGIAI', duration: 1876, category: 6, views: 456000 },
  { title: 'Messi Career Best Goals',                            url: 'https://www.youtube.com/watch?v=yDFTcjP3lMo', duration: 2341, category: 6, views: 623000 },
  { title: 'NBA Finals 2024 Best Plays',                         url: 'https://www.youtube.com/watch?v=sZmvMpFzrZg', duration: 1654, category: 6, views: 891000 },
  { title: 'Craziest Sports Moments 2024',                       url: 'https://www.youtube.com/watch?v=KzJHHMm6mVo', duration: 2890, category: 6, views: 534000 },

  // ZaraMusicOfficial — Music (cat 4)
  { title: 'Tum Hi Ho — Cover Song',                             url: 'https://www.youtube.com/watch?v=Umqb9KENgmk', duration: 312,  category: 4, views: 234000 },
  { title: 'Pakistani OST Medley 2024',                          url: 'https://www.youtube.com/watch?v=3AtDnEC4zak', duration: 1823, category: 4, views: 189000 },
  { title: 'How I Make Music at Home Studio',                    url: 'https://www.youtube.com/watch?v=GtzTM4WTVOQ', duration: 1456, category: 4, views: 98000  },
  { title: 'Acoustic Live Session — 5 Songs',                    url: 'https://www.youtube.com/watch?v=450p7goxZqg', duration: 2341, category: 4, views: 145000 },
  { title: 'Best Pakistani Songs 2024',                          url: 'https://www.youtube.com/watch?v=aBkTkxKDduc', duration: 987,  category: 4, views: 312000 },

  // TylerComedy — Comedy (cat 7)
  { title: 'Types of People at the Airport',                     url: 'https://www.youtube.com/watch?v=FqkqAFKJDOc', duration: 743,  category: 7, views: 456000 },
  { title: 'Asking Strangers Random Questions',                  url: 'https://www.youtube.com/watch?v=BKAbQjKNMFI', duration: 623,  category: 7, views: 789000 },
  { title: 'Stand Up Comedy Special 2024',                       url: 'https://www.youtube.com/watch?v=3HRcTukMkMk', duration: 3600, category: 7, views: 234000 },
  { title: 'Roasting Social Media Trends',                       url: 'https://www.youtube.com/watch?v=Gg3DOW7aFgE', duration: 912,  category: 7, views: 567000 },
  { title: 'Growing Up in the 2000s — Comedy',                   url: 'https://www.youtube.com/watch?v=F87pTnECRs0', duration: 834,  category: 7, views: 891000 },

  // AmirFunny — Comedy (cat 7)
  { title: 'Roasting Desi Drama Clichés',                        url: 'https://www.youtube.com/watch?v=p17An7FvqbQ', duration: 1102, category: 7, views: 312000 },
  { title: 'Types of Students in Every University',              url: 'https://www.youtube.com/watch?v=lOfZLb33uCg', duration: 876,  category: 7, views: 445000 },
  { title: 'Desi Parents vs Western Parents',                    url: 'https://www.youtube.com/watch?v=yJQ1A2PBbGw', duration: 743,  category: 7, views: 678000 },
  { title: 'Pakistani Student Life Abroad',                      url: 'https://www.youtube.com/watch?v=ZAeNqSFJFyI', duration: 1234, category: 7, views: 234000 },
  { title: 'Things Every Desi Can Relate To',                    url: 'https://www.youtube.com/watch?v=fA3TQNB3q0w', duration: 923,  category: 7, views: 567000 },

  // SofiaMusic — Music (cat 4)
  { title: 'Adele Hello — Piano Cover',                          url: 'https://www.youtube.com/watch?v=YQHsXMglC9A', duration: 287,  category: 4, views: 1200000 },
  { title: 'How to Improve Your Voice in 30 Days',               url: 'https://www.youtube.com/watch?v=7PCkvCPvDXk', duration: 1456, category: 4, views: 345000  },
  { title: 'Writing My First Original Song',                     url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0', duration: 1823, category: 4, views: 234000  },
  { title: 'Reacting to My Old Covers',                          url: 'https://www.youtube.com/watch?v=hT_nvWreIhg', duration: 1102, category: 4, views: 189000  },
  { title: 'Best Pop Songs of 2024 — My Ranking',               url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', duration: 1234, category: 4, views: 456000  },
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
                [userRow.Id, c.channel, c.bio, Math.floor(Math.random() * 500000) + 10000],
                (err, result) => err ? reject(err) : resolve(result)
            );
        });

        const creatorRow = await new Promise((resolve, reject) => {
            db.query('SELECT Id FROM creator WHERE UserId = ?', [userRow.Id],
                (err, result) => err ? reject(err) : resolve(result[0])
            );
        });

        const myVideos = videoData.slice(i * 5, i * 5 + 5);
        for (const v of myVideos) {
            const videoResult = await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO video (CreatorId, CategoryId, Title, VideoUrl, Duration, Views, Status, UploadDate)
                     VALUES (?, ?, ?, ?, ?, ?, 'Published', DATE_SUB(NOW(), INTERVAL ? DAY))`,
                    [creatorRow.Id, v.category, v.title, v.url, v.duration, v.views,
                     Math.floor(Math.random() * 90) + 1],
                    (err, result) => err ? reject(err) : resolve(result)
                );
            });

            const videoId = videoResult.insertId;

            await new Promise((resolve) => {
                db.query('UPDATE creator SET TotalViews = TotalViews + ? WHERE Id = ?',
                    [v.views, creatorRow.Id], () => resolve()
                );
            });
        }

        console.log(`✅ ${c.channel} (${c.country}) — 5 videos added`);
    }

    console.log('\n🎉 Seed complete! 14 creators and 70 videos added.');
    process.exit();
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
// Mekan — demo maglumatlary (mock data)
// Seneler "dayOffset" görnüşinde berilýär: 0 = şu gün, -3 = 3 gün öň, 2 = 2 günden.

const AGENTS = [
  { id: 1, name: "Kerim Ataýew", role: "Administrator", phone: "+993 65 41 22 18", color: "#ed6a3a" },
  { id: 2, name: "Aýna Gurbanowa", role: "Agent", phone: "+993 62 77 30 05", color: "#7c8a61" },
  { id: 3, name: "Döwlet Saparow", role: "Agent", phone: "+993 61 08 54 90", color: "#b3794d" },
];

const PROPERTY_TYPES = {
  kwartira: "Kwartira",
  jay: "Hususy jaý",
  ofis: "Ofis",
  sowda: "Söwda meýdany",
  yer: "Ýer bölegi",
};

const DEAL_TYPES = { satlyk: "Satylýar", kerende: "Kireýine" };

const PROPERTY_STATUS = {
  isjen: "Işjeň",
  bron: "Bron edildi",
  satyldy: "Ýapyldy",
};

const DISTRICTS = [
  "Köpetdag etraby",
  "Berkararlyk etraby",
  "Bagtyýarlyk etraby",
  "Büzmeýin etraby",
  "Arkadag şäheri",
  "Änew şäheri",
  "Mary şäheri",
  "Awaza",
];

const CLIENT_STATUS = {
  taze: "Täze",
  habarlasyldy: "Habarlaşyldy",
  gorkezildi: "Görkezildi",
  gepleshik: "Gepleşikde",
  yapyldy: "Ylalaşyk",
};

const CLIENT_SOURCES = ["Instagram", "imo", "Saýt", "Jaň", "Tanyş arkaly"];

const DEAL_STAGES = [
  { id: "ilkinji", name: "Ilkinji habarlaşyk" },
  { id: "gorkezis", name: "Görkeziş" },
  { id: "gepleshik", name: "Gepleşik" },
  { id: "resminama", name: "Resminamalar" },
  { id: "tamamlandy", name: "Tamamlandy" },
];

const SEED_PROPERTIES = [
  {
    id: 101, title: "3 otagly kwartira, Bitarap Türkmenistan şaýoly", type: "kwartira", deal: "satlyk",
    price: 1150000, district: "Köpetdag etraby", address: "Bitarap Türkmenistan şaýoly, 214-nji jaý",
    rooms: 3, area: 118, floor: 7, floors: 12, renovation: "Ýewro remont", furnished: true,
    features: ["Lift", "Balkon", "Awtoduralga", "Kondisioner", "Täze jaý"],
    status: "isjen", agentId: 1, owner: "Rahman Ataýew", ownerPhone: "+993 65 12 44 70",
    created: -2, views: 184, featured: true,
    description: "Täze gurlan 12 gatly jaýda ýagtylykly 3 otagly kwartira. Iki balkon, aýry aşhana we myhman otagy. Golaýynda mekdep, çagalar bagy we söwda merkezi bar. Resminamalary taýýar.",
  },
  {
    id: 102, title: "2 otagly kwartira, Parahat 7", type: "kwartira", deal: "kerende",
    price: 6500, district: "Bagtyýarlyk etraby", address: "Parahat 7, 12-nji jaý",
    rooms: 2, area: 64, floor: 3, floors: 5, renovation: "Gowy remont", furnished: true,
    features: ["Balkon", "Kir ýuwujy maşyn", "Internet"],
    status: "isjen", agentId: 2, owner: "Bägül Myradowa", ownerPhone: "+993 62 30 11 84",
    created: -1, views: 96, featured: false,
    description: "Doly mebelli, ähli enjamlary bilen 2 otagly kwartira. Uzak möhletleýin kärendä maşgala üçin berilýär. Jemgyýetçilik ulagynyň duralgasy 2 minutlyk aralykda.",
  },
  {
    id: 103, title: "Täze durmuş üçin giň jaý, Çoganly", type: "jay", deal: "satlyk",
    price: 2400000, district: "Büzmeýin etraby", address: "Çoganly, Gülzemin köçesi, 8",
    rooms: 6, area: 320, floor: 2, floors: 2, renovation: "Ýewro remont", furnished: false,
    features: ["Howly", "Garaž", "Basseýn", "Ýylyşhana", "Wideogözegçilik"],
    status: "isjen", agentId: 1, owner: "Serdar Gurbanow", ownerPhone: "+993 65 90 21 37",
    created: -6, views: 241, featured: true,
    description: "6 sotuk ýerde 2 gatly hususy jaý. Giň howly, 2 awtoulag üçin garaž, açyk basseýn. Jaý doly abatlanan, ähli kommunikasiýalar birikdirilen.",
  },
  {
    id: 104, title: "Ofis, Oguzhan köçesi", type: "ofis", deal: "kerende",
    price: 18000, district: "Berkararlyk etraby", address: "Oguzhan köçesi, 38, işewür merkezi",
    rooms: 4, area: 145, floor: 5, floors: 9, renovation: "Ofis remonty", furnished: true,
    features: ["Lift", "Kabul ediş", "Awtoduralga", "Garawul", "Internet"],
    status: "bron", agentId: 3, owner: "\"Ak Ýol\" HJ", ownerPhone: "+993 12 48 70 12",
    created: -9, views: 133, featured: false,
    description: "Işewür merkezinde 4 kabinetli ofis. Ýygnak otagy, aşhana we 2 sanuzel. Merkezleşdirilen kondisionerleme ulgamy.",
  },
  {
    id: 105, title: "1 otagly kwartira, Mir 2", type: "kwartira", deal: "satlyk",
    price: 520000, district: "Bagtyýarlyk etraby", address: "Mir 2/1, 23-nji jaý",
    rooms: 1, area: 42, floor: 4, floors: 4, renovation: "Orta", furnished: false,
    features: ["Balkon", "Gaz peç"],
    status: "isjen", agentId: 2, owner: "Gülälek Amanowa", ownerPhone: "+993 61 55 02 19",
    created: -3, views: 72, featured: false,
    description: "Ýaş maşgala ýa-da maýa goýum üçin amatly 1 otagly kwartira. Golaýynda bazar we hassahana.",
  },
  {
    id: 106, title: "Söwda meýdany, Atatürk köçesi", type: "sowda", deal: "kerende",
    price: 25000, district: "Köpetdag etraby", address: "Atatürk köçesi, 82",
    rooms: 2, area: 90, floor: 1, floors: 5, renovation: "Gowy remont", furnished: false,
    features: ["Aýratyn giriş", "Witrina", "Awtoduralga"],
    status: "isjen", agentId: 3, owner: "Batyr Hojamuradow", ownerPhone: "+993 65 03 88 41",
    created: -12, views: 158, featured: false,
    description: "Köçä bakýan aýratyn girişli söwda meýdany. Uly witrinalar, adam akymy köp ýerde. Dükan, kafe ýa-da salon üçin amatly.",
  },
  {
    id: 107, title: "4 otagly kwartira, Arçabil şaýoly", type: "kwartira", deal: "satlyk",
    price: 1650000, district: "Berkararlyk etraby", address: "Arçabil şaýoly, 51-nji jaý",
    rooms: 4, area: 165, floor: 9, floors: 16, renovation: "Ýewro remont", furnished: true,
    features: ["Lift", "Panorama penjireler", "Awtoduralga", "Garawul", "Kondisioner"],
    status: "isjen", agentId: 1, owner: "Maýsa Begmyradowa", ownerPhone: "+993 62 14 63 90",
    created: 0, views: 37, featured: true,
    description: "Elit jaýda dag görnüşli 4 otagly kwartira. Iki sanuzel, garderob otagy, ýerasty awtoduralga. Jaýyň çäginde çagalar meýdançasy we fitnes zal.",
  },
  {
    id: 108, title: "Ýer bölegi, Arkadag şäheriniň golaýynda", type: "yer", deal: "satlyk",
    price: 380000, district: "Arkadag şäheri", address: "Arkadag şäheri, günorta tarapy",
    rooms: 0, area: 1000, floor: 0, floors: 0, renovation: "—", furnished: false,
    features: ["Elektrik", "Suw", "Asfalt ýol"],
    status: "isjen", agentId: 3, owner: "Döwlet Nurmuhammedow", ownerPhone: "+993 61 70 44 26",
    created: -15, views: 64, featured: false,
    description: "10 sotuk ýaşaýyş jaýy gurmak üçin niýetlenen ýer bölegi. Elektrik we suw ulgamy golaýda. Resminamalary doly.",
  },
  {
    id: 109, title: "Kottej, Awaza", type: "jay", deal: "kerende",
    price: 3500, district: "Awaza", address: "Awaza, deňiz kenary, 4-nji kottej",
    rooms: 3, area: 140, floor: 1, floors: 1, renovation: "Ýewro remont", furnished: true,
    features: ["Deňiz görnüşi", "Terassa", "Mangal", "Awtoduralga"],
    status: "isjen", agentId: 2, owner: "Ogulbike Saparowa", ownerPhone: "+993 65 26 19 03",
    created: -4, views: 212, featured: true,
    description: "Deňiz kenarynda dynç almak üçin kottej. Gündelik kärende (baha 1 gün üçin). Terassa, mangal we hususy awtoduralga.",
  },
  {
    id: 110, title: "2 otagly kwartira, 30-njy mikroraýon", type: "kwartira", deal: "satlyk",
    price: 690000, district: "Berkararlyk etraby", address: "30-njy mkr., 7-nji jaý",
    rooms: 2, area: 68, floor: 2, floors: 9, renovation: "Gowy remont", furnished: false,
    features: ["Lift", "Balkon"],
    status: "satyldy", agentId: 1, owner: "Jeren Ataýewa", ownerPhone: "+993 62 44 01 58",
    created: -28, views: 301, featured: false,
    description: "Gowy remontly 2 otagly kwartira. Mekdep we bazar golaýda.",
  },
  {
    id: 111, title: "3 otagly kwartira, Täze zaman", type: "kwartira", deal: "kerende",
    price: 9000, district: "Köpetdag etraby", address: "Täze zaman ýaşaýyş toplumy, 3-nji jaý",
    rooms: 3, area: 105, floor: 6, floors: 12, renovation: "Ýewro remont", furnished: true,
    features: ["Lift", "Kondisioner", "Kir ýuwujy maşyn", "Internet", "Balkon"],
    status: "isjen", agentId: 2, owner: "Merdan Annaýew", ownerPhone: "+993 65 61 37 72",
    created: -5, views: 119, featured: false,
    description: "Doly mebelli we enjamlaşdyrylan 3 otagly kwartira. Daşary ýurt raýatlaryna hem berilýär.",
  },
  {
    id: 112, title: "Maşgala üçin döwrebap jaý, Änew", type: "jay", deal: "satlyk",
    price: 1350000, district: "Änew şäheri", address: "Änew, Bitaraplyk köçesi, 16",
    rooms: 5, area: 210, floor: 1, floors: 1, renovation: "Gowy remont", furnished: false,
    features: ["Howly", "Garaž", "Ýylyşhana"],
    status: "bron", agentId: 3, owner: "Aýgözel Orazowa", ownerPhone: "+993 61 92 50 66",
    created: -10, views: 175, featured: false,
    description: "Bir gatly 5 otagly jaý. Uly howly, miweli agaçlar, garaž. Ähli kommunikasiýalar birikdirilen.",
  },
];

const SEED_CLIENTS = [
  {
    id: 201, name: "Merdan Annaýew", phone: "+993 65 33 18 20", source: "Instagram", status: "gepleshik",
    interest: { deal: "satlyk", type: "kwartira", rooms: 3, district: "Köpetdag etraby" },
    budgetMin: 900000, budgetMax: 1200000, agentId: 1, created: -14, lastActivity: 0,
    notes: [
      { at: -14, text: "Instagram arkaly ýazdy. Köpetdag etrabynda 3 otagly kwartira gözleýär." },
      { at: -7, text: "Bitarap Türkmenistan şaýolundaky kwartirany görkezdik, gaty halady." },
      { at: 0, text: "Baha boýunça gepleşik: 1 100 000 TMT teklip etdi." },
    ],
  },
  {
    id: 202, name: "Aýgözel Orazowa", phone: "+993 62 51 07 43", source: "Saýt", status: "taze",
    interest: { deal: "kerende", type: "kwartira", rooms: 2, district: "Bagtyýarlyk etraby" },
    budgetMin: 5000, budgetMax: 7000, agentId: 2, created: 0, lastActivity: 0,
    notes: [{ at: 0, text: "Saýtdaky forma arkaly ýüz tutdy. Uzak möhletli kärende gerek." }],
  },
  {
    id: 203, name: "Batyr Hojamuradow", phone: "+993 65 03 88 41", source: "Tanyş arkaly", status: "gorkezildi",
    interest: { deal: "satlyk", type: "jay", rooms: 5, district: "Büzmeýin etraby" },
    budgetMin: 1800000, budgetMax: 2600000, agentId: 1, created: -9, lastActivity: -1,
    notes: [
      { at: -9, text: "Tanyşy arkaly geldi. Uly howlusy bolan jaý gerek." },
      { at: -1, text: "Çoganlydaky jaýy görkezdik. Aýaly bilen ýene bir gezek gelmekçi." },
    ],
  },
  {
    id: 204, name: "Jeren Ataýewa", phone: "+993 62 44 01 58", source: "Jaň", status: "yapyldy",
    interest: { deal: "satlyk", type: "kwartira", rooms: 2, district: "Berkararlyk etraby" },
    budgetMin: 600000, budgetMax: 700000, agentId: 1, created: -40, lastActivity: -6,
    notes: [
      { at: -40, text: "Jaň etdi, 2 otagly kwartira gözleýär." },
      { at: -6, text: "Şertnama baglaşyldy. 30-njy mkr. kwartira satyldy." },
    ],
  },
  {
    id: 205, name: "Serdar Gurbanow", phone: "+993 65 90 21 37", source: "imo", status: "habarlasyldy",
    interest: { deal: "kerende", type: "ofis", rooms: 4, district: "Berkararlyk etraby" },
    budgetMin: 12000, budgetMax: 20000, agentId: 3, created: -3, lastActivity: -1,
    notes: [{ at: -3, text: "Täze açylýan kompaniýa üçin ofis gerek, 4–5 kabinet." }],
  },
  {
    id: 206, name: "Maýsa Begmyradowa", phone: "+993 62 14 63 90", source: "Instagram", status: "gorkezildi",
    interest: { deal: "kerende", type: "kwartira", rooms: 3, district: "Köpetdag etraby" },
    budgetMin: 7000, budgetMax: 10000, agentId: 2, created: -6, lastActivity: -2,
    notes: [
      { at: -6, text: "Mebelli 3 otagly kwartira gözleýär, 1 ýyl möhlet." },
      { at: -2, text: "Täze zamandaky kwartirany görkezdik." },
    ],
  },
  {
    id: 207, name: "Döwlet Nurmuhammedow", phone: "+993 61 70 44 26", source: "Jaň", status: "taze",
    interest: { deal: "satlyk", type: "kwartira", rooms: 1, district: "Bagtyýarlyk etraby" },
    budgetMin: 400000, budgetMax: 550000, agentId: 2, created: -1, lastActivity: -1,
    notes: [{ at: -1, text: "Maýa goýum üçin kiçi kwartira gözleýär." }],
  },
  {
    id: 208, name: "Ogulbike Saparowa", phone: "+993 65 26 19 03", source: "Saýt", status: "gepleshik",
    interest: { deal: "satlyk", type: "kwartira", rooms: 4, district: "Berkararlyk etraby" },
    budgetMin: 1400000, budgetMax: 1800000, agentId: 1, created: -5, lastActivity: 0,
    notes: [
      { at: -5, text: "Arçabil şaýolunda uly kwartira isleýär." },
      { at: 0, text: "Ertir 4 otagly kwartirany görkezmek bellenildi." },
    ],
  },
  {
    id: 209, name: "Rahman Ataýew", phone: "+993 65 12 44 70", source: "Tanyş arkaly", status: "habarlasyldy",
    interest: { deal: "kerende", type: "sowda", rooms: 2, district: "Köpetdag etraby" },
    budgetMin: 20000, budgetMax: 30000, agentId: 3, created: -8, lastActivity: -4,
    notes: [{ at: -8, text: "Kafe açmak üçin merkezde söwda meýdany gerek." }],
  },
  {
    id: 210, name: "Bägül Myradowa", phone: "+993 62 30 11 84", source: "Instagram", status: "taze",
    interest: { deal: "kerende", type: "jay", rooms: 3, district: "Awaza" },
    budgetMin: 2500, budgetMax: 4000, agentId: 2, created: 0, lastActivity: 0,
    notes: [{ at: 0, text: "Tomus dynç alyşy üçin Awazada kottej soraýar." }],
  },
  {
    id: 211, name: "Gülälek Amanowa", phone: "+993 61 55 02 19", source: "imo", status: "gorkezildi",
    interest: { deal: "satlyk", type: "yer", rooms: 0, district: "Arkadag şäheri" },
    budgetMin: 300000, budgetMax: 450000, agentId: 3, created: -11, lastActivity: -3,
    notes: [{ at: -11, text: "Jaý gurmak üçin ýer bölegi gözleýär." }],
  },
  {
    id: 212, name: "Mekan Çaryýew", phone: "+993 65 77 40 12", source: "Saýt", status: "habarlasyldy",
    interest: { deal: "satlyk", type: "jay", rooms: 5, district: "Änew şäheri" },
    budgetMin: 1200000, budgetMax: 1500000, agentId: 3, created: -4, lastActivity: -2,
    notes: [{ at: -4, text: "Änewde howluly jaý isleýär." }],
  },
];

const SEED_DEALS = [
  { id: 301, propertyId: 101, clientId: 201, stage: "gepleshik", amount: 1100000, agentId: 1 },
  { id: 302, propertyId: 103, clientId: 203, stage: "gorkezis", amount: 2400000, agentId: 1 },
  { id: 303, propertyId: 110, clientId: 204, stage: "tamamlandy", amount: 680000, agentId: 1 },
  { id: 304, propertyId: 104, clientId: 205, stage: "resminama", amount: 18000, agentId: 3 },
  { id: 305, propertyId: 111, clientId: 206, stage: "gepleshik", amount: 9000, agentId: 2 },
  { id: 306, propertyId: 105, clientId: 207, stage: "ilkinji", amount: 520000, agentId: 2 },
  { id: 307, propertyId: 107, clientId: 208, stage: "gorkezis", amount: 1650000, agentId: 1 },
  { id: 308, propertyId: 106, clientId: 209, stage: "ilkinji", amount: 25000, agentId: 3 },
  { id: 309, propertyId: 109, clientId: 210, stage: "ilkinji", amount: 3500, agentId: 2 },
  { id: 310, propertyId: 112, clientId: 212, stage: "resminama", amount: 1320000, agentId: 3 },
  { id: 311, propertyId: 108, clientId: 211, stage: "gepleshik", amount: 370000, agentId: 3 },
];

const SEED_VIEWINGS = [
  { id: 401, propertyId: 107, clientId: 208, day: 1, time: "11:00", agentId: 1, status: "plan" },
  { id: 402, propertyId: 102, clientId: 202, day: 0, time: "16:30", agentId: 2, status: "plan" },
  { id: 403, propertyId: 103, clientId: 203, day: 2, time: "10:00", agentId: 1, status: "plan" },
  { id: 404, propertyId: 106, clientId: 209, day: 0, time: "12:00", agentId: 3, status: "plan" },
  { id: 405, propertyId: 109, clientId: 210, day: 3, time: "15:00", agentId: 2, status: "plan" },
  { id: 406, propertyId: 105, clientId: 207, day: 4, time: "09:30", agentId: 2, status: "plan" },
  { id: 407, propertyId: 111, clientId: 206, day: -2, time: "18:00", agentId: 2, status: "done" },
  { id: 408, propertyId: 101, clientId: 201, day: -7, time: "17:00", agentId: 1, status: "done" },
  { id: 409, propertyId: 108, clientId: 211, day: -3, time: "11:30", agentId: 3, status: "done" },
  { id: 410, propertyId: 104, clientId: 205, day: -1, time: "14:00", agentId: 3, status: "done" },
  { id: 411, propertyId: 112, clientId: 212, day: 5, time: "13:00", agentId: 3, status: "plan" },
];

// Soňky 6 aýyň komissiýa girdejisi (TMT)
const SEED_REVENUE = [38500, 52200, 41800, 67400, 59100, 73900];

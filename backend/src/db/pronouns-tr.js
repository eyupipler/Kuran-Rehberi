/**
 * Lemma'sı NULL olan zamirler ve hurufu mukatta'a
 * Eşleşme: normalized(arabic_word) + '|' + pos
 */
module.exports = {
  // Zamirler
  'هم|N': 'onlar',
  'همو|N': 'onlar',
  'همُ|N': 'onlar',
  'انت|N': 'sen',
  'انتَ|N': 'sen',
  'انتم|N': 'siz',
  'هي|N': 'o',
  'هى|N': 'o',
  'انا|N': 'ben',
  'نحن|N': 'biz',
  'هن|N': 'onlar (dişil)',
  'هنَ|N': 'onlar (dişil)',
  'هما|N': 'o ikisi',
  'انتما|N': 'siz ikiniz',
  'هيه|N': 'o, kendisi',

  // Hurufu mukatta'a
  'الم|P': 'Elif Lâm Mîm',
  'الر|P': 'Elif Lâm Râ',
  'المر|P': 'Elif Lâm Mîm Râ',
  'المص|P': 'Elif Lâm Mîm Sâd',
  'حم|P': 'Hâ Mîm',
  'طسم|P': 'Tâ Sîn Mîm',
  'طس|P': 'Tâ Sîn',
  'طه|P': 'Tâ Hâ',
  'يس|P': 'Yâ Sîn',
  'ص|P': 'Sâd',
  'ق|P': 'Kâf',
  'ن|P': 'Nûn',
  'كهيعص|P': 'Kâf Hâ Yâ Ayn Sâd',
  'عسق|P': 'Ayn Sîn Kâf',
  'حمعسق|P': 'Hâ Mîm Ayn Sîn Kâf',
};

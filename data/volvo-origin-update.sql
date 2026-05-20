-- Volvo Penta origin data
-- 5L and 8L engines: manufactured at VE Powertrain plant, Pithampur, India
-- 11L and above: manufactured at Skövde plant, Sweden

UPDATE engines SET origin = 'India' WHERE slug IN (
  'volvo-penta-tad580ve',
  'volvo-penta-tad581ve',
  'volvo-penta-tad582ve',
  'volvo-penta-tad840ge-b',
  'volvo-penta-tad841ge',
  'volvo-penta-tad842ge',
  'volvo-penta-tad843ge',
  'volvo-penta-tad851ge',
  'volvo-penta-tad852ge',
  'volvo-penta-tad853ge',
  'volvo-penta-tad880ge',
  'volvo-penta-tad881ge',
  'volvo-penta-tad882ge',
  'volvo-penta-tad880ve',
  'volvo-penta-tad881ve',
  'volvo-penta-tad882ve',
  'volvo-penta-tad883ve'
);

UPDATE engines SET origin = 'Sweden' WHERE slug IN (
  'volvo-penta-tad1181ve',
  'volvo-penta-tad1341ge-b',
  'volvo-penta-tad1342ge-b',
  'volvo-penta-tad1343ge-b',
  'volvo-penta-tad1344ge-b',
  'volvo-penta-tad1345ge-b',
  'volvo-penta-tad1346ge',
  'volvo-penta-tad1350ge',
  'volvo-penta-tad1351ge',
  'volvo-penta-tad1352ge',
  'volvo-penta-tad1353ge',
  'volvo-penta-tad1354ge',
  'volvo-penta-tad1355ge',
  'volvo-penta-tad1380ge',
  'volvo-penta-tad1381ge',
  'volvo-penta-tad1382ge',
  'volvo-penta-tad1381ve',
  'volvo-penta-tad1382ve',
  'volvo-penta-tad1383ve',
  'volvo-penta-tad1384ve',
  'volvo-penta-tad1385ve',
  'volvo-penta-tad1641ge-b',
  'volvo-penta-tad1642ge-b',
  'volvo-penta-tad1650ge',
  'volvo-penta-tad1651ge',
  'volvo-penta-twd1644ge',
  'volvo-penta-twd1645ge',
  'volvo-penta-twd1652ge',
  'volvo-penta-twd1653ge',
  'volvo-penta-twd1682ge',
  'volvo-penta-twd1683ge',
  'volvo-penta-twd1744ge'
);

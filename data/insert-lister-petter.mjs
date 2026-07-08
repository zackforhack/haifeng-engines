// Lister Petter generator-drive engines from:
// "generating set power selector 26.3.xlsx" (Chinese/English power selector)
//
// Workbook columns:
// C-F: 1500 rpm engine gross/net kWm; G-J: 50 Hz recommended genset kWe/kVA
// K-N: 1800 rpm engine gross/net kWm; O-R: 60 Hz recommended genset kWe/kVA
// This import stores net engine kWm plus recommended generator electrical ratings.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const RAW = `
SA Series Mechanical Pump	SA315G1	Stage II	12	13.2	11.5	12.7	9.6	12	10.4	13	14	15.4	13.5	14.9	11	13.7	12	15	No dual-frequency switching
SA Series Mechanical Pump	SA423G1	Stage II	16	17.6	15.3	16.9	13	16	14	18	20	22	19.25	21.25	16	20	17.6	22	No dual-frequency switching
SA Series Mechanical Pump	SA427G1	Stage II	20.5	22.55	19.5	21.55	17	21	19	23	24.5	26.95	23.5	26	20	25	22	27.5	No dual-frequency switching
SA Series Mechanical Pump	SA430G1	Stage II	24.5	26.95	23.5	26	20	25	22	27.5	27.5	30	26	28.5	22	27.5	24.2	30.25	No dual-frequency switching
SA Series Mechanical Pump	SA432G1	Stage II	30.5	33.55	29	32.5	SA	#VALUE!	27	33.75	37.5	42	35.5	40	30	37.5	33	41.25	No dual-frequency switching
SA Series Mechanical Pump	SA432G2	Stage II	39	44	36.5	41.5	32	40	35.2	44	42	46	39.5	43.5	35	43.75	38.5	48.125	No dual-frequency switching
SA Series Mechanical Pump	SA435G1	Stage II	49	53.9	46.5	51.4	40	50	44	55	59	65	56.5	62.5	50	62.5	55	68.75	No dual-frequency switching
SA Series Mechanical Pump	SA441G1	Stage II	59	64.9	54	60.9	48	60	53	66	70	77	65	73	60	75	66	82.5	No dual-frequency switching
SA Series Mechanical Pump	SA441G2	Stage II	64	70.4	59	66.4	53	66.25	58	72	76	83	71	79	65	81.25	71.5	89.375	No dual-frequency switching
Mechanical Pump	LP443G1	Stage II 	51	56	49	54	40	50	44	55	62	68	60	66	48	60	52.8	66	Dual-frequency switchable
Mechanical Pump	LP443G2	Stage II 	62	68	60	66	50	62.5	55	68.75	67	74	65	72	56	70	61.6	77	Dual-frequency switchable
Mechanical Pump	LP443G3	Stage II 	78	86	76	84	66	82.5	72	90	86	95	84	93	72	90	80	100	Dual-frequency switchable
Mechanical Pump	LP443G4	Stage II 	95	105	90	100	80	100	88	110	105	116	100	111	90	112.5	100	125	Dual-frequency switchable
Mechanical Pump	LP443G5	Stage II 	105	116	99	110	90	112.5	100	125	120	132	114	126	100	125	110	137.5	Dual-frequency switchable
Mechanical Pump	LP443G6	Stage II 	120	132	114	126	100	125	110	137.5	120	132	114	126	100	125	110	137.5	Dual-frequency switchable
Mechanical Pump	LP665G1	Stage II 	128	141	122	135	110	137.5	120	150	136	150	130	144	120	150	132	165	Dual-frequency switchable
Mechanical Pump	LP665G2	Stage II 	140	155	131	146	120	150	132	165	150	165	141	156	132	165	145.2	181.5	Dual-frequency switchable
Mechanical Pump	LP665G3	Stage II 	168	185	159	176	150	187.5	165	206.25	168	185	159	176	150	187.5	165	206.25	Dual-frequency switchable
Mechanical Pump	LP689G1	Stage II 	185	204	179	198	165	206.25	181.5	226.875	205	226	199	220	180	225	198	247.5	Dual-frequency switchable
Mechanical Pump	LP689G2	Stage II 	208	228	202	222	180	225	198	247.5	228	250	222	244	200	250	220	275	Dual-frequency switchable
Mechanical Pump	LP689G3	Stage II 	230	253	224	247	200	250	220	275	255	282	249	276	220	275	242	302.5	Dual-frequency switchable
Mechanical Pump	LP612G1	Stage II 	255	280	245	270	224	280	246	307.5	268	282	258	272	240	300	264	330	Dual-frequency switchable
Mechanical Pump	LP612G2	Stage II 	280	308	270	298	260	325	286	357.5	307	338	297	328	280	350	308	385	Dual-frequency switchable
Mechanical Pump	LP612G3	Stage II 	307	338	297	328	280	350	308	385	307	338	297	328	280	350	308	385	Dual-frequency switchable
Mechanical Pump	LP613G1	Stage II 	339	373	324	358	300	375	330	412.5	368	405	353	390	320	400	352	440	Dual-frequency switchable
Mechanical Pump	LP613G2	Stage II 	368	405	353	390	320	400	352	440	368	405	353	390	320	400	352	440	Dual-frequency switchable
Mechanical Pump	LP625G5	Stage II 	660	726	638	704	600	750	660	825	/	/	/	/	/	/	/	/	/
ECU Electronic	LP311EVG1	Stage V	11	12.1	10	11.1	8	10	8.8	11	13.2	15	12.2	14	9.6	12	10.6	13.2	Dual-frequency
ECU Electronic	LP322EVG1	Stage V	32	35	30	33	25	31.25	28	34	36	40	34	38	30	37.5	33	41	Dual-frequency
ECU Electronic	LP322EVG2	Stage V	40	44	37.5	41.5	32	40	35	44	49	54	46.5	51.5	40	50	44	55	Dual-frequency
ECU Electronic	LP430EVG2	Stage V	49	54	46.5	51.5	40	50	44	55	54	60	51.5	57.5	45	56	50	62	Dual-frequency
ECU Electronic	LP311EG1	Stage III	11	12.1	10	11.1	8	10	8.8	11	13.2	14.52	12.2	13.52	9.6	12	10.6	13.2	Dual-frequency
ECU Electronic	LP429EG1	Stage III	27	30	25	28	22	27.5	24	30	30	33	28	31	24	30	26	32	Dual-frequency
ECU Electronic	LP432EG2	Stage III	55	60	52.5	57.5	40	50	44	55	60	66	57.5	63.5	50	62.5	55	68.5	Dual-frequency
ECU Electronic	LP435EG2	Stage III	74	81	71.5	78.5	60	75	64	80	74	81	71.5	78.5	64	80	70	88	Dual-frequency
ECU Electronic	LP441EG6	Stage III	95	105	90	100	80	100	88	110	105	115	100	110	90	112.5	100	125	Dual-frequency
ECU Electronic	LP443EG3	Stage III	78	86	73	81	66	82.5	72	90	86	95	81	90	72	90	79	98.75	Dual-frequency
ECU Electronic	LP443EG4	Stage III	95	105	89	99	80	100	88	110	105	116	99	110	90	110	100	125	Dual-frequency
ECU Electronic	LP443EG5	Stage III	106	117	100	111	90	110	100	125	120	132	114	126	100	125	110	137.5	Dual-frequency
ECU Electronic	LP443EG6	Stage III	125	140	119	134	110	137.5	120	150	125	140	119	134	110	137.5	120	150	Dual-frequency
ECU Electronic	LP665EG1	Stage III	128	141	119	132	110	137.5	120	150	136	150	127	141	120	150	132	165	Dual-frequency
ECU Electronic	LP665EG2	Stage III	140	155	131	146	120	150	132	165	150	165	141	156	132	165	144	180	Dual-frequency
ECU Electronic	LP665EG3	Stage III	168	185	159	176	150	187.5	164	205	180	198	171	189	160	200	176	220	Dual-frequency
ECU Electronic	LP665EG4	Stage III	186	205	177	196	160	200	176	220	205	226	196	217	180	225	200	250	Dual-frequency
ECU Electronic	LP689EG1	Stage III	185	204	179	198	160	200	176	220	205	226	199	220	180	225	196	245	Dual-frequency
ECU Electronic	LP689EG2	Stage III	195	228	189	222	180	225	196	245	235	259	229	253	200	250	220	275	Dual-frequency
ECU Electronic	LP689EG3	Stage III	230	253	224	247	200	250	220	275	255	280	249	274	220	275	240	300	Dual-frequency
ECU Electronic	LP689EG4	Stage III	255	280	249	274	220	275	240	300	280	308	274	302	240	300	264	330	Dual-frequency
ECU Electronic	LP612EG1	Stage III	280	308	270	298	250	312.5	272	340	307	338	297	328	280	350	308	385	Dual-frequency
ECU Electronic	LP612EG2	Stage III	307	338	297	328	280	350	308	385	340	380	330	370	300	375	328	410	Dual-frequency
ECU Electronic	LP612EG3	Stage III	340	380	330	370	300	375	328	410	340	380	330	370	300	375	328	410	Dual-frequency
ECU Electronic	LP613EG1	Stage III	360	400	345	385	320	400	352	440	401	441	386	426	360	450	384	480	Dual-frequency
ECU Electronic	LP613EG2	Stage III	401	441	386	426	360	450	392	490	/	/	/	/	/	/	/	/	/
ECU Electronic	LP613EG3	Stage III	450	495	435	480	400	500	435	544	/	/	/	/	/	/	/	/	/
ECU Electronic	LP613EG4	Stage III	/	/	/	/	/	/	/	/	450	495	435	480	400	500	435.2	544	/
ECU Electronic	LP617EG1	Stage III	565	622	543	600	500	625	550	687.5	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG1	Stage III	460	506	438	484	400	500	436	545	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG2	Stage III	520	572	498	550	460	575	504	630	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG3	Stage III	572	629	550	607	510	637.5	556	695	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG4	Stage III	622	684	600	662	560	700	612	765	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG5	Stage III	685	754	661	730	600	750	656	820	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG6	Stage III	/	/	/	/	/	/	/	/	685	754	661	730	600	750	656	820	/
ECU Electronic	LP625EG7	Stage III	728	800	704	776	660	825	720	900	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG8	Stage III	/	/	/	/	/	/	/	/	728	800	704	776	660	825	720	900	/
ECU Electronic	LP625EG9	Stage III	820	902	785	867	720	900	788	985	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG10	Stage III	880	968	845	933	800	1000	876	1095	/	/	/	/	/	/	/	/	/
ECU Electronic	LP625EG11	Stage III	/	/	/	/	/	/	/	/	820	902	785	867	720	900	788	985	/
ECU Electronic	LP625EG12	Stage III	/	/	/	/	/	/	/	/	880	968	845	933	800	1000	876	1095	/
ECU Electronic	LP625SG1	Stage III	460	506	438	484	400	500	436	545	520	572	498	550	460	575	504	630	Dual-frequency
ECU Electronic	LP625SG2	Stage III	520	572	498	550	460	575	504	630	572	629	550	607	510	638	556	695	Dual-frequency
ECU Electronic	LP625SG3	Stage III	572	629	550	607	510	638	556	695	622	684	600	662	560	700	612	765	Dual-frequency
ECU Electronic	LP625SG4	Stage III	622	684	600	662	560	700	612	765	622	684	600	662	560	700	612	765	Dual-frequency
Earth Max Electronic	LP2041EG1	Stage III	1020	1120	975	1075	900	1125	1000	1250	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP2041EG2	Stage III	1115	1225	1070	1180	1000	1250	1100	1375	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP1054EG1	Stage III	1345	1490	1290	1435	1200	1500	1320	1650	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP1054EG2	Stage III	1520	1670	1465	1615	1350	1687.5	1500	1875	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP1265EG1	Stage III	1680	1850	1616	1780	1500	1875	1650	2062.5	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP1265EG2	Stage III	1810	1990	1746	1926	1640	2050	1800	2250	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP1686EG1	Stage III	2000	2220	1922	2142	1800	2250	2000	2500	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP1686EG2	Stage III	2220	2440	2135	2355	2000	2500	2200	2750	/	/	/	/	/	/	/	/	/
Earth Max Electronic	LP2041EG18	Stage III	/	/	/	/	/	/	/	/	1020	1120	975	1075	900	1125	1000	1250	/
Earth Max Electronic	LP2041EG28	Stage III	/	/	/	/	/	/	/	/	1115	1225	1070	1180	1000	1250	1100	1375	/
Earth Max Electronic	LP1054EG18	Stage III	/	/	/	/	/	/	/	/	1345	1490	1290	1435	1200	1500	1320	1650	/
Earth Max Electronic	LP1054EG28	Stage III	/	/	/	/	/	/	/	/	1520	1670	1465	1615	1350	1687.5	1500	1875	/
Earth Max Electronic	LP1265EG18	Stage III	/	/	/	/	/	/	/	/	1680	1850	1616	1780	1500	1875	1650	2062.5	/
Earth Max Electronic	LP1265EG28	Stage III	/	/	/	/	/	/	/	/	1810	1990	1746	1926	1640	2050	1800	2250	/
Earth Max Electronic	LP1686EG18	Stage III	/	/	/	/	/	/	/	/	2000	2220	1922	2142	1800	2250	2000	2500	/
Earth Max Electronic	LP1686EG28	Stage III	/	/	/	/	/	/	/	/	2220	2440	2135	2355	2000	2500	2200	2750	/
`

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function num(value) {
  const text = String(value ?? '').trim()
  if (!text || text === '/' || text === '#VALUE!' || text === 'SA') return null
  const parsed = Number(text)
  if (!Number.isFinite(parsed)) return null
  return Math.round(parsed * 1000) / 1000
}

function emissions(value) {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (/stage\s*v$/i.test(normalized)) return 'Euro Stage V'
  if (/stage\s*iii$/i.test(normalized)) return 'Euro Stage III'
  if (/stage\s*ii$/i.test(normalized)) return 'Euro Stage II'
  return normalized
}

function ratingPhrase(row) {
  const parts = []
  if (row.prime_power_kwe_50hz != null || row.standby_power_kwe_50hz != null) {
    parts.push(`50 Hz ${row.prime_power_kwe_50hz ?? '-'} kWe prime / ${row.standby_power_kwe_50hz ?? '-'} kWe standby`)
  }
  if (row.prime_power_kwe_60hz != null || row.standby_power_kwe_60hz != null) {
    parts.push(`60 Hz ${row.prime_power_kwe_60hz ?? '-'} kWe prime / ${row.standby_power_kwe_60hz ?? '-'} kWe standby`)
  }
  return parts.join('; ')
}

const rows = RAW.trim().split('\n').map((line) => line.split('\t'))

const records = rows.map(([series, model, stage, grossPrime50, grossStandby50, netPrime50, netStandby50, primeKwe50, primeKva50, standbyKwe50, standbyKva50, grossPrime60, grossStandby60, netPrime60, netStandby60, primeKwe60, primeKva60, standbyKwe60, standbyKva60, note]) => {
  const rec = {
    slug: `lister-petter-${slugify(model)}`,
    brand: 'Lister Petter',
    model,
    series,
    status: 'active',
    origin: 'United Kingdom',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    emissions_standard: emissions(stage),
    rpm_rated: num(primeKwe50) != null || num(standbyKwe50) != null ? 1500 : 1800,
    power_kw: num(netStandby50) ?? num(netStandby60) ?? num(grossStandby50) ?? num(grossStandby60),
    prime_power_kw_50hz: num(netPrime50),
    standby_power_kw_50hz: num(netStandby50),
    prime_power_kwe_50hz: num(primeKwe50),
    prime_power_kva_50hz: num(primeKva50),
    standby_power_kwe_50hz: num(standbyKwe50),
    standby_power_kva_50hz: num(standbyKva50),
    prime_power_kw_60hz: num(netPrime60),
    standby_power_kw_60hz: num(netStandby60),
    prime_power_kwe_60hz: num(primeKwe60),
    prime_power_kva_60hz: num(primeKva60),
    standby_power_kwe_60hz: num(standbyKwe60),
    standby_power_kva_60hz: num(standbyKva60),
  }

  const noteText = note && note !== '/' ? ` ${note}.` : ''
  rec.description = `Lister Petter ${model} ${series.toLowerCase()} diesel generator-drive engine. ${ratingPhrase(rec)}. ${rec.emissions_standard} emissions.${noteText}`
  return rec
})

const slugCounts = new Map()
for (const record of records) slugCounts.set(record.slug, (slugCounts.get(record.slug) ?? 0) + 1)
const duplicates = [...slugCounts].filter(([, count]) => count > 1)
if (duplicates.length) {
  console.error(`Duplicate slugs: ${duplicates.map(([slug]) => slug).join(', ')}`)
  process.exit(1)
}

const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log(`Upserted ${records.length} Lister Petter engines`)

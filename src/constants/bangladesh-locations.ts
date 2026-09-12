import divisionsData from "bangladesh-geojson/divisions";
import districtsData from "bangladesh-geojson/districts";
import upazilasData from "bangladesh-geojson/upazilas";
import dhakaCityData from "bangladesh-geojson/dhaka-city";

export type LocationOption = {
  id: string;
  name: string;
};

type DivisionRecord = LocationOption;

type DistrictRecord = LocationOption & {
  division_id: string;
};

type UpazilaRecord = LocationOption & {
  district_id: string;
};

type DhakaCityRecord = {
  division_id: string;
  district_id: string;
  name: string;
};

const divisions = (divisionsData as { divisions: DivisionRecord[] }).divisions;
const districts = (districtsData as { districts: DistrictRecord[] }).districts;
const upazilas = (upazilasData as { upazilas: UpazilaRecord[] }).upazilas;
const dhakaCityAreas = (dhakaCityData as { dhaka: DhakaCityRecord[] }).dhaka;

const normalizeComparable = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const toOption = ({ id, name }: LocationOption): LocationOption => ({ id, name: name.trim() });

const sortByEnglishName = (records: LocationOption[]): LocationOption[] =>
  [...records].sort((first, second) =>
    normalizeComparable(first.name).localeCompare(normalizeComparable(second.name), "en", { sensitivity: "base" }),
  );

const uniqueByName = (records: LocationOption[]): LocationOption[] => {
  const seen = new Set<string>();
  return records.filter((record) => {
    const normalizedName = normalizeComparable(record.name);
    if (seen.has(normalizedName)) return false;
    seen.add(normalizedName);
    return true;
  });
};

const findDivision = (divisionIdOrName: string) => {
  const normalized = normalizeComparable(divisionIdOrName);
  return divisions.find((division) => division.id === divisionIdOrName || normalizeComparable(division.name) === normalized);
};

const findDistrict = (districtIdOrName: string, divisionIdOrName?: string) => {
  const normalized = normalizeComparable(districtIdOrName);
  const division = divisionIdOrName ? findDivision(divisionIdOrName) : undefined;

  return districts.find((district) => {
    const districtMatches = district.id === districtIdOrName || normalizeComparable(district.name) === normalized;
    return districtMatches && (!division || district.division_id === division.id);
  });
};

export function getDivisions(): LocationOption[] {
  return sortByEnglishName(divisions.map(toOption));
}

export function getDistrictsByDivision(divisionIdOrName: string): LocationOption[] {
  const division = findDivision(divisionIdOrName);
  if (!division) return [];

  return sortByEnglishName(districts.filter((district) => district.division_id === division.id).map(toOption));
}

export function getUpazilasByDistrict(districtIdOrName: string, divisionIdOrName?: string): LocationOption[] {
  const district = findDistrict(districtIdOrName, divisionIdOrName);
  if (!district) return [];

  const districtUpazilas = upazilas.filter((upazila) => upazila.district_id === district.id).map(toOption);

  if (normalizeComparable(district.name) !== "dhaka") {
    return sortByEnglishName(districtUpazilas);
  }

  const cityAreas = dhakaCityAreas
    .filter((area) => area.division_id === district.division_id && area.district_id === district.id)
    .map((area) => ({ id: `dhaka-city:${area.name}`, name: area.name.trim() }));

  return sortByEnglishName(uniqueByName([...cityAreas, ...districtUpazilas]));
}

export const DIVISIONS = getDivisions();

export const LOCATION_DATA_COUNTS = {
  divisions: divisions.length,
  districts: districts.length,
  upazilas: upazilas.length,
};

declare module "bangladesh-geojson/divisions" {
  const data: {
    divisions: Array<{ id: string; name: string; bn_name?: string; lat?: string; long?: string }>;
  };
  export default data;
}

declare module "bangladesh-geojson/districts" {
  const data: {
    districts: Array<{ id: string; division_id: string; name: string; bn_name?: string; lat?: string; long?: string }>;
  };
  export default data;
}

declare module "bangladesh-geojson/upazilas" {
  const data: {
    upazilas: Array<{ id: string; district_id: string; name: string; bn_name?: string }>;
  };
  export default data;
}

declare module "bangladesh-geojson/dhaka-city" {
  const data: {
    dhaka: Array<{
      division_id: string;
      district_id: string;
      city_corporation?: string;
      name: string;
      bn_name?: string;
    }>;
  };
  export default data;
}


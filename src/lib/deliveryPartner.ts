import type {
  DeliveryAssignmentStatus,
  DeliveryPartnerAccountMode,
  DeliveryPartnerGender,
  DeliveryPartnerProfile,
  DeliveryPartnerType,
  UserProfile,
} from './supabase';

export const DELIVERY_PARTNER_TYPES: Array<{
  value: DeliveryPartnerType;
  label: string;
  description: string;
}> = [
  {
    value: 'hosteller',
    label: 'Hosteller',
    description: 'Stay inside campus hostels and pick nearby food orders fast.',
  },
  {
    value: 'non_hosteller',
    label: 'Non-hosteller',
    description: 'Operate from outside hostel blocks and cover open campus zones.',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    description: 'Faculty members who want to handle scheduled or nearby deliveries.',
  },
];

export const DELIVERY_PARTNER_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const DELIVERY_HOSTELS = [
  'BH1',
  'BH2',
  'BH3',
  'BH4',
  'BH5',
  'BH6',
  'BH7',
  'BH8',
  'BH9',
  'BH10',
  'GH1',
  'GH2',
  'GH3',
  'GH4',
  'GH5',
  'GH6',
  'GH7',
  'GH8',
  'GH9',
];

export const DELIVERY_APP_MODE_STORAGE_KEY = 'vajra-app-mode';

export const DELIVERY_MODE_SYNC_INTERVAL = 8000;

export const normalizeDeliveryAccountMode = (
  value: string | null | undefined
): DeliveryPartnerAccountMode => (value === 'delivery' ? 'delivery' : 'customer');

export const getDeliveryPartnerTypeLabel = (value: DeliveryPartnerType) => {
  switch (value) {
    case 'hosteller':
      return 'Hosteller';
    case 'non_hosteller':
      return 'Non-hosteller';
    case 'teacher':
      return 'Teacher';
    default:
      return 'Partner';
  }
};

export const getDeliveryAssignmentStatusLabel = (value: DeliveryAssignmentStatus) => {
  switch (value) {
    case 'assigned':
      return 'Accepted';
    case 'picked_up':
      return 'Picked up';
    case 'delivered':
      return 'Delivered';
    case 'unassigned':
    default:
      return 'Awaiting rider';
  }
};

export const buildDeliveryPartnerBaseLabel = (
  profile: Pick<
    DeliveryPartnerProfile,
    | 'partner_type'
    | 'hostel_name'
    | 'block'
    | 'room_number'
    | 'building_number'
    | 'cabin_number'
    | 'area_label'
  >
) => {
  if (profile.partner_type === 'hosteller') {
    return [profile.hostel_name, profile.block, profile.room_number ? `Room ${profile.room_number}` : null]
      .filter(Boolean)
      .join(', ');
  }

  if (profile.partner_type === 'teacher') {
    return [profile.building_number, profile.cabin_number ? `Cabin ${profile.cabin_number}` : null]
      .filter(Boolean)
      .join(', ');
  }

  return profile.area_label || 'Off-campus';
};

export const getDefaultDeliveryPartnerForm = (
  profile: UserProfile | null
): {
  name: string;
  phone: string;
  gender: DeliveryPartnerGender | '';
  partnerType: DeliveryPartnerType;
  hostelName: string;
  block: string;
  roomNumber: string;
  buildingNumber: string;
  cabinNumber: string;
  areaLabel: string;
} => {
  const inferredPartnerType: DeliveryPartnerType =
    profile?.user_role === 'teacher'
      ? 'teacher'
      : profile?.hostel_name
        ? 'hosteller'
        : 'non_hosteller';

  return {
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    gender: (profile?.gender?.toLowerCase() as DeliveryPartnerGender | '') || '',
    partnerType: inferredPartnerType,
    hostelName: profile?.hostel_name ?? '',
    block: profile?.block ?? '',
    roomNumber: profile?.room_number ?? '',
    buildingNumber: profile?.building_number ?? '',
    cabinNumber: profile?.cabin_number ?? '',
    areaLabel:
      profile?.exact_location ||
      [profile?.building_number, profile?.block, profile?.room_number]
        .filter(Boolean)
        .join(', '),
  };
};

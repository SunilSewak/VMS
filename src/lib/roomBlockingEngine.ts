// Mock Room Blocking Engine for Architecture Phase

export interface RoomRequirement {
  roomType: 'Single' | 'Double' | 'Triple';
  count: number;
}

export interface RoomingConfig {
  designation: string;
  roomType: 'Single' | 'Double' | 'Triple';
  occupancy: number; // 1, 2, or 3
}

// Simulated Master Data configuration
const MASTER_ROOMING_RULES: RoomingConfig[] = [
  { designation: 'SO', roomType: 'Triple', occupancy: 3 },
  { designation: 'DM', roomType: 'Double', occupancy: 2 },
  { designation: 'RSM', roomType: 'Single', occupancy: 1 },
  { designation: 'ZSM', roomType: 'Single', occupancy: 1 },
  { designation: 'CH', roomType: 'Single', occupancy: 1 }
];

export const roomBlockingEngine = {
  /**
   * Calculates room requirements based on designation counts
   */
  calculateRequirements: (designationCounts: Record<string, number>): RoomRequirement[] => {
    let singleRooms = 0;
    let doubleRooms = 0;
    let tripleRooms = 0;

    Object.entries(designationCounts).forEach(([designation, count]) => {
      if (count <= 0) return;

      const rule = MASTER_ROOMING_RULES.find(r => r.designation === designation);
      
      // Default to Double if no rule found
      if (!rule) {
        doubleRooms += Math.ceil(count / 2);
        return;
      }

      if (rule.roomType === 'Single') {
        singleRooms += count;
      } else if (rule.roomType === 'Double') {
        doubleRooms += Math.ceil(count / 2);
      } else if (rule.roomType === 'Triple') {
        tripleRooms += Math.ceil(count / 3);
      }
    });

    return [
      { roomType: 'Single', count: singleRooms },
      { roomType: 'Double', count: doubleRooms },
      { roomType: 'Triple', count: tripleRooms },
    ].filter(r => r.count > 0);
  },
  
  getAvailableDesignations: () => MASTER_ROOMING_RULES.map(r => r.designation)
};

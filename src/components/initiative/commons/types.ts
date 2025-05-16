export enum Modifier {Strength = 'str', Dexterity= 'dex', Constitution = 'con', Intelligence = 'int', Wisdom = 'wis', Charisma = 'cha'};

export interface Attack{
    name: string;
    toHit: string;
    damage: string;
  };
  

export interface AttackRow{
  name: string;
  toHit: number;
  damage: number;
};
  export interface InitiativeRowFormInputs{
    name: string;
    amount: string;
    initiative: string;
    ac: string;
    hp: string;
    abilities: Record<Modifier, string>;
    mod: Record<Modifier, string>;
    save: Record<Modifier, string>;
    attacks: Attack[];
  };

  export interface InitiativeRowProps{
    name: string;
    initiative: number;
    ac: number;
    hp: number;
    abilities: Record<Modifier, number>;
    mod: Record<Modifier, number>;
    save: Record<Modifier, number>;
    attacks: AttackRow[];
  };
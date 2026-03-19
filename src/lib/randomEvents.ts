// Random events system for Zombie Insurance Simulator

import { RandomEvent, GameState } from '@/types/game';
import { RANDOM_EVENTS, RANDOM_EVENT_CHANCE } from './constants';

// Get a random event (or null if no event this round)
export function rollForRandomEvent(wave: number): RandomEvent | null {
  // Slightly increase event chance as game progresses
  const adjustedChance = RANDOM_EVENT_CHANCE + (wave * 0.005);

  if (Math.random() > adjustedChance) {
    return null;
  }

  // Weight events by type: 40% positive, 30% negative, 30% neutral
  const roll = Math.random();
  let filteredEvents: RandomEvent[];

  if (roll < 0.4) {
    filteredEvents = RANDOM_EVENTS.filter(e => e.type === 'positive');
  } else if (roll < 0.7) {
    filteredEvents = RANDOM_EVENTS.filter(e => e.type === 'negative');
  } else {
    filteredEvents = RANDOM_EVENTS.filter(e => e.type === 'neutral');
  }

  if (filteredEvents.length === 0) {
    filteredEvents = RANDOM_EVENTS;
  }

  return filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
}

// Apply random event effects to game state
export function applyRandomEvent(event: RandomEvent, currentState: {
  money: number;
  health: number;
}): {
  money: number;
  health: number;
  insuranceDiscount: number;
  insurancePriceIncrease: number;
  message: string;
} {
  let money = currentState.money;
  let health = currentState.health;
  let insuranceDiscount = 0;
  let insurancePriceIncrease = 0;
  const messages: string[] = [];

  if (event.effect.money) {
    money += event.effect.money;
    if (event.effect.money > 0) {
      messages.push(`+$${event.effect.money}`);
    } else {
      messages.push(`-$${Math.abs(event.effect.money)}`);
    }
  }

  if (event.effect.health) {
    health += event.effect.health;
    health = Math.max(1, health); // Don't let events kill the player
    if (event.effect.health > 0) {
      messages.push(`+${event.effect.health} health`);
    } else {
      messages.push(`${event.effect.health} health`);
    }
  }

  if (event.effect.insuranceDiscount) {
    insuranceDiscount = event.effect.insuranceDiscount;
    messages.push(`${insuranceDiscount}% insurance discount!`);
  }

  if (event.effect.insurancePriceIncrease) {
    insurancePriceIncrease = event.effect.insurancePriceIncrease;
    messages.push(`+${insurancePriceIncrease}% insurance costs`);
  }

  return {
    money,
    health,
    insuranceDiscount,
    insurancePriceIncrease,
    message: messages.join(', ')
  };
}

// Get event type color for display
export function getEventTypeColor(type: RandomEvent['type']): string {
  switch (type) {
    case 'positive': return 'text-green-400';
    case 'negative': return 'text-red-400';
    case 'neutral': return 'text-blue-400';
  }
}

export function getEventTypeBgColor(type: RandomEvent['type']): string {
  switch (type) {
    case 'positive': return 'bg-green-500/20 border-green-500';
    case 'negative': return 'bg-red-500/20 border-red-500';
    case 'neutral': return 'bg-blue-500/20 border-blue-500';
  }
}

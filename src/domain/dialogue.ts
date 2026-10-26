import { CHEF_BY_ID } from '../data/chefs';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import type { AppData, ChefId } from './types';

export type DialogueContext =
  | { kind: 'kitchen'; name: string; data: AppData }
  | { kind: 'fridge'; data: AppData; selected: string[] }
  | { kind: 'seasoning'; owned: number; total: number }
  | { kind: 'poke'; chefId: ChefId }
  | { kind: 'results'; name: string; picked: string[]; total: number; ready: number; surprise?: boolean }
  | { kind: 'recipe'; everything: boolean; missingCount: number; minutes: number };

const pick = <T,>(arr: T[], avoid?: string) => {
  const pool = arr.filter((x) => String(x) !== avoid);
  return (pool.length ? pool : arr)[Math.floor(Math.random() * (pool.length ? pool.length : arr.length))];
};

function hour() {
  return new Date().getHours();
}

/** Short, contextual chef lines. `last` avoids saying the same thing twice in a row. */
export function chefLine(ctx: DialogueContext, last?: string): string {
  switch (ctx.kind) {
    case 'kitchen': {
      const { name, data } = ctx;
      const stocked = data.inventory.filter((i) => i.quantity > 0);
      const h = hour();
      const timely =
        h < 11 ? `Morning, ${name}. Tea first. Then greatness.`
        : h < 15 ? `Lunch o’clock, ${name}. Let’s see what we’ve got.`
        : h < 21 ? `Hey ${name}! What’s cooking tonight?`
        : `Late snack, ${name}? I won’t tell.`;
      if (stocked.length === 0) {
        return pick([`Hey ${name}. The fridge is echoing. Add a few things?`, 'Empty fridge, full potential. Let’s stock up.'], last);
      }
      const lines = [timely, `Hey ${name}! Ready to make something good?`, 'Leftovers are just dinner wearing pajamas.'];
      if (stocked.length >= 10) lines.push('Look at you, fully stocked and thriving.');
      const tomato = stocked.find((i) => i.ingredientId === 'tomato');
      if (tomato) lines.push('Still got those tomatoes? I’ve got ideas.');
      const random = stocked[Math.floor(Math.random() * stocked.length)];
      const ing = INGREDIENT_BY_ID[random.ingredientId];
      if (ing) lines.push(`That ${ing.name.toLowerCase()} isn’t going to cook itself.`);
      return pick(lines, last);
    }
    case 'fridge': {
      const n = ctx.selected.length;
      if (ctx.data.inventory.length === 0) return 'Hmm… just light and shelves in here.';
      if (n === 0) return pick(['Hmm… what do we have here?', 'Tap what you feel like using.', 'Let’s see what we’ve got.'], last);
      if (n === 1) {
        const ing = INGREDIENT_BY_ID[ctx.selected[0]];
        return `${ing?.name ?? 'That'}? Good start.`;
      }
      if (n === 2) return 'Two things. We can work with that.';
      if (n === 3) return 'Three ingredients? Challenge accepted.';
      return pick(['Now we’re cooking. Almost.', 'That’s a proper haul.', 'Hmm. We can definitely work with that.'], last);
    }
    case 'seasoning': {
      const r = ctx.owned / ctx.total;
      if (r > 0.75) return 'This rack could start a restaurant.';
      if (r > 0.4) return 'Solid shelf. Tap anything you’re out of.';
      return 'Salt, oil, and hope. Tap what you have.';
    }
    case 'results': {
      const first = ctx.picked[0] ? INGREDIENT_BY_ID[ctx.picked[0]]?.name.toLowerCase() : null;
      if (ctx.total === 0) return 'Nothing fits those filters. Loosen them up?';
      if (ctx.surprise) {
        return pick(['Still got those tomatoes? I’ve got ideas.', 'Leave it to me. Here’s what I’d make.', `Trust me, ${ctx.name}. This one.`], last);
      }
      if (ctx.ready >= 3) return pick([`You have everything for ${ctx.ready} of these. Nice.`, 'Look at you, fully stocked and thriving.'], last);
      if (ctx.ready > 0) return pick([`${ctx.ready === 1 ? 'One' : ctx.ready} ready to go. The rest need a little shopping.`, 'Hmm. We can work with that.'], last);
      if (first) return `${first.charAt(0).toUpperCase() + first.slice(1)}? I’ve got ideas. A quick shop helps.`;
      return 'Close calls. A short shopping trip fixes most of these.';
    }
    case 'recipe': {
      if (ctx.everything) return pick(['You have everything. Let’s cook.', 'Good pick. All set.'], last);
      if (ctx.missingCount === 1) return 'Just one thing short. We can work around it, or grab it.';
      if (ctx.minutes <= 15) return 'Quick one. Dinner in a blink.';
      return 'A few things to grab first.';
    }
    case 'poke': {
      const chef = CHEF_BY_ID[ctx.chefId];
      return pick([...chef.lines, 'Yes? I’m thinking.', 'Hungry yet?'], last);
    }
  }
}

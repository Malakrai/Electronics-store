import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

/** Fade + slide (lux) */
export const fadeUp = trigger('fadeUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate('650ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ])
]);

/** Stagger children */
export const staggerList = trigger('staggerList', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      stagger(90, [
        animate('520ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ], { optional: true })
  ])
]);

/** Micro pop for cards */
export const cardPop = trigger('cardPop', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px) scale(.98)' }),
    animate('520ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({ opacity: 1, transform: 'translateY(0) scale(1)' })
    )
  ])
]);

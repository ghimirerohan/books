<template>
  <div
    class="
      bg-white
      dark:bg-gray-875
      border border-gray-200
      dark:border-gray-800
      rounded-lg
      shadow-lg
      p-3
      w-64
      select-none
    "
  >
    <!-- Header: month / year navigation -->
    <div class="flex items-center justify-between mb-2">
      <button
        class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        type="button"
        @click="changeMonth(-1)"
      >
        <FeatherIcon name="chevron-left" class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-1 text-sm font-medium">
        <select
          v-model.number="viewMonth"
          class="bg-transparent focus:outline-none cursor-pointer"
        >
          <option v-for="(m, i) in monthNames" :key="i" :value="i + 1">
            {{ m }}
          </option>
        </select>
        <select
          v-model.number="viewYear"
          class="bg-transparent focus:outline-none cursor-pointer"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">
            {{ display(y) }}
          </option>
        </select>
      </div>

      <button
        class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        type="button"
        @click="changeMonth(1)"
      >
        <FeatherIcon name="chevron-right" class="w-4 h-4" />
      </button>
    </div>

    <!-- Weekday row -->
    <div
      class="
        grid grid-cols-7
        text-center text-xs text-gray-500
        dark:text-gray-400
        mb-1
      "
    >
      <div v-for="(w, i) in weekdayNames" :key="i" class="py-1">{{ w }}</div>
    </div>

    <!-- Day grid -->
    <div class="grid grid-cols-7 text-center text-sm">
      <div v-for="(day, i) in cells" :key="i" class="p-0.5">
        <button
          v-if="day"
          type="button"
          class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          :class="dayClasses(day)"
          @click="selectDay(day)"
        >
          {{ display(day) }}
        </button>
      </div>
    </div>

    <!-- Today shortcut -->
    <div class="mt-2 flex justify-center">
      <button
        type="button"
        class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        @click="goToToday"
      >
        {{ t`Today` }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { t } from 'fyo';
import { fyo } from 'src/initFyo';
import {
  adToBs,
  bsMonthsEn,
  bsMonthsNp,
  bsToAd,
  bsWeekdaysEn,
  bsWeekdaysNp,
  daysInBsMonth,
  shouldUseDevanagari,
  toDevanagariDigits,
} from 'fyo/utils/nepaliDate';
import { defineComponent, PropType } from 'vue';
import { DEFAULT_LOCALE } from 'fyo/utils/consts';

export default defineComponent({
  name: 'NepaliDatePicker',
  props: {
    /** Currently selected value as a Gregorian Date, or null. */
    selected: { type: [Date, null] as PropType<Date | null>, default: null },
  },
  emits: ['select'],
  data() {
    const base = this.selected ?? new Date();
    const bs = adToBs(base);
    return {
      viewYear: bs.year,
      viewMonth: bs.month,
    };
  },
  computed: {
    useDevanagari(): boolean {
      const locale =
        (fyo.singles.SystemSettings?.locale as string) ?? DEFAULT_LOCALE;
      const numberSystem = fyo.singles.SystemSettings?.numberSystem as
        | string
        | undefined;
      return shouldUseDevanagari(locale, numberSystem);
    },
    monthNames(): string[] {
      return this.useDevanagari ? bsMonthsNp : bsMonthsEn;
    },
    weekdayNames(): string[] {
      return this.useDevanagari ? bsWeekdaysNp : bsWeekdaysEn;
    },
    yearOptions(): number[] {
      const current = adToBs(new Date()).year;
      const years: number[] = [];
      for (let y = current - 75; y <= current + 25; y++) {
        years.push(y);
      }
      return years;
    },
    monthDays(): number {
      return daysInBsMonth(this.viewYear, this.viewMonth);
    },
    firstWeekday(): number {
      return bsToAd(this.viewYear, this.viewMonth, 1).getDay();
    },
    cells(): (number | null)[] {
      const cells: (number | null)[] = [];
      for (let i = 0; i < this.firstWeekday; i++) {
        cells.push(null);
      }
      for (let d = 1; d <= this.monthDays; d++) {
        cells.push(d);
      }
      return cells;
    },
    selectedBs(): { year: number; month: number; day: number } | null {
      if (!this.selected) {
        return null;
      }
      return adToBs(this.selected);
    },
    todayBs(): { year: number; month: number; day: number } {
      return adToBs(new Date());
    },
  },
  methods: {
    t,
    display(value: number): string {
      const str = String(value);
      return this.useDevanagari ? toDevanagariDigits(str) : str;
    },
    changeMonth(delta: number) {
      let month = this.viewMonth + delta;
      let year = this.viewYear;
      if (month < 1) {
        month = 12;
        year -= 1;
      } else if (month > 12) {
        month = 1;
        year += 1;
      }
      this.viewMonth = month;
      this.viewYear = year;
    },
    goToToday() {
      const bs = this.todayBs;
      this.viewYear = bs.year;
      this.viewMonth = bs.month;
    },
    selectDay(day: number) {
      const date = bsToAd(this.viewYear, this.viewMonth, day);
      this.$emit('select', date);
    },
    isSelected(day: number): boolean {
      const s = this.selectedBs;
      return (
        !!s &&
        s.year === this.viewYear &&
        s.month === this.viewMonth &&
        s.day === day
      );
    },
    isToday(day: number): boolean {
      const today = this.todayBs;
      return (
        today.year === this.viewYear &&
        today.month === this.viewMonth &&
        today.day === day
      );
    },
    dayClasses(day: number): string {
      if (this.isSelected(day)) {
        return 'bg-blue-500 text-white hover:bg-blue-500';
      }
      if (this.isToday(day)) {
        return 'border border-blue-500 text-blue-600 dark:text-blue-400';
      }
      return 'text-gray-900 dark:text-gray-100';
    },
  },
});
</script>

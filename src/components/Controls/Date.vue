<template>
  <div class="relative">
    <div v-if="showLabel" :class="labelClasses">
      {{ df.label }}
    </div>
    <input
      v-show="showInput && !useBs"
      ref="input"
      :class="[inputClasses, containerClasses]"
      :type="inputType"
      :value="inputValue"
      :placeholder="inputPlaceholder"
      :readonly="isReadOnly"
      :tabindex="isReadOnly ? '-1' : '0'"
      @blur="onBlur"
      @focus="onFocus"
      @input="(e) => $emit('input', e)"
    />
    <div
      v-show="!showInput || useBs"
      class="flex"
      :class="[containerClasses, sizeClasses]"
      tabindex="0"
      @click="activateInput"
      @focus="activateInput"
    >
      <p
        v-if="!isEmpty"
        :class="[baseInputClasses]"
        class="overflow-auto no-scrollbar whitespace-nowrap dark:text-gray-100"
      >
        {{ formattedValue }}
      </p>
      <p v-else-if="inputPlaceholder" class="text-base text-gray-500 w-full">
        {{ inputPlaceholder }}
      </p>

      <button v-if="!isReadOnly" class="-me-0.5 ms-1">
        <FeatherIcon
          name="calendar"
          class="w-4 h-4"
          :class="
            showMandatory ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
          "
        />
      </button>
    </div>

    <!-- Bikram Sambat (Nepali) date picker -->
    <template v-if="useBs && showBsPicker">
      <div class="fixed inset-0 z-10" @click="showBsPicker = false" />
      <div class="absolute z-20 mt-1">
        <NepaliDatePicker :selected="selectedDate" @select="onBsSelect" />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { DateTime } from 'luxon';
import { fyo } from 'src/initFyo';
import { defineComponent, nextTick } from 'vue';
import Base from './Base.vue';
import NepaliDatePicker from './NepaliDatePicker.vue';

export default defineComponent({
  extends: Base,
  components: { NepaliDatePicker },
  emits: ['input', 'focus', 'change'],
  data() {
    return {
      showInput: false,
      showBsPicker: false,
    };
  },
  computed: {
    useBs(): boolean {
      return fyo.singles.SystemSettings?.calendarSystem === 'Bikram Sambat';
    },
    selectedDate(): Date | null {
      let value = this.value;
      if (typeof value === 'string') {
        value = new Date(value);
      }
      if (value instanceof Date && !Number.isNaN(value.valueOf())) {
        return value;
      }
      return null;
    },
    inputValue(): string {
      let value = this.value;
      if (typeof value === 'string') {
        value = new Date(value);
      }

      if (value instanceof Date && !Number.isNaN(value.valueOf())) {
        return DateTime.fromJSDate(value).toISODate();
      }

      return '';
    },
    inputType() {
      return 'date';
    },
    formattedValue() {
      const value = this.parse(this.value);
      return fyo.format(value, this.df, this.doc);
    },
    borderClasses(): string {
      if (!this.border) {
        return '';
      }

      const border = 'border border-gray-200 dark:border-gray-800';
      let background = 'bg-gray-25 dark:bg-gray-875';
      if (this.isReadOnly) {
        background = 'bg-gray-50 dark:bg-gray-850';
      }

      if (this.showInput) {
        return background;
      }

      return border + ' ' + background;
    },
  },
  methods: {
    onFocus(e: FocusEvent) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      target.select();
      this.showInput = true;
      this.$emit('focus', e);
    },
    onBlur(e: FocusEvent) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      this.showInput = false;

      let value: Date | null = DateTime.fromISO(target.value).toJSDate();
      if (Number.isNaN(value.valueOf())) {
        value = null;
      }

      this.triggerChange(value);
    },
    activateInput() {
      if (this.isReadOnly) {
        return;
      }

      if (this.useBs) {
        this.showBsPicker = !this.showBsPicker;
        return;
      }

      this.showInput = true;
      nextTick(() => {
        this.focus();

        // @ts-ignore
        this.$refs.input.showPicker();
      });
    },
    onBsSelect(date: Date) {
      let result = date;

      // Preserve the time-of-day for Datetime fields.
      if (this.inputType === 'datetime-local' && this.selectedDate) {
        result = new Date(date);
        result.setHours(
          this.selectedDate.getHours(),
          this.selectedDate.getMinutes(),
          this.selectedDate.getSeconds(),
          0
        );
      }

      this.triggerChange(result);
      this.showBsPicker = false;
    },
  },
});
</script>

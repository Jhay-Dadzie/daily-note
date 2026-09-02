import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useTheme } from '@/context/ThemeContext';
import { elevation, radius, spacing } from '@/components/constants/themeColor';
import {
  FONT_FAMILIES,
  FONT_SIZES,
  TEXT_COLORS,
} from '@/components/constants/typography';
import { useHaptics } from '@/hooks/useHaptics';
import { useMotion } from '@/hooks/useMotion';

const THEME_MODES = [
  { key: 'system', label: 'System', icon: 'adjust' },
  { key: 'light', label: 'Light', icon: 'sun-o' },
  { key: 'dark', label: 'Dark', icon: 'moon-o' },
];

function Section({ title, subtitle, children }) {
  const { theme, typography } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[typography.title, styles.sectionTitle]}>{title}</Text>
      {!!subtitle && (
        <Text style={[typography.meta, { color: theme.muted, marginBottom: spacing.md }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
}

/** Equal-width horizontal picker used for theme mode and font size. */
function Segmented({ options, value, onChange, renderLabel }) {
  const { theme, typography } = useTheme();
  const haptics = useHaptics();

  return (
    <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
      {options.map(option => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => {
              haptics.select();
              onChange(option.key);
            }}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.surface },
              selected && elevation(theme, 1),
            ]}
          >
            {renderLabel ? (
              renderLabel(option, selected)
            ) : (
              <>
                {option.icon && (
                  <FontAwesome
                    name={option.icon}
                    size={13}
                    color={selected ? theme.accent : theme.muted}
                  />
                )}
                <Text
                  style={[
                    typography.meta,
                    { color: selected ? theme.title : theme.muted },
                  ]}
                >
                  {option.label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** A labelled switch with a supporting line of explanation. */
function SwitchRow({ label, hint, value, onChange, disabled }) {
  const { theme, typography } = useTheme();

  return (
    <View
      style={[
        styles.switchRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
        disabled && { opacity: 0.6 },
      ]}
    >
      <View style={styles.flex}>
        <Text style={typography.body}>{label}</Text>
        <Text style={[typography.meta, { color: theme.muted }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ true: theme.accent, false: theme.border }}
        thumbColor={theme.surface}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, typography, colorScheme, preferences, updatePreference, resetPreferences } =
    useTheme();
  const haptics = useHaptics();
  const motion = useMotion();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Live preview — everything below changes this card immediately. */}
      <Animated.View
        layout={motion.when(LinearTransition.springify().damping(18))}
        style={[
          styles.preview,
          elevation(theme, 2),
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[typography.meta, { color: theme.muted }]}>PREVIEW</Text>
        <Text style={[typography.display, styles.previewTitle]}>Market list</Text>
        <Text style={typography.body}>
          Tomatoes, onions and a bag of rice. Pick up the tailoring on the way
          back before the shop closes at six.
        </Text>
      </Animated.View>

      <Section title="Appearance">
        <Segmented
          options={THEME_MODES}
          value={preferences.themeMode}
          onChange={mode => updatePreference('themeMode', mode)}
        />
      </Section>

      <Section title="Font" subtitle="Applies to every note, to-do and reminder.">
        <View style={styles.fontList}>
          {FONT_FAMILIES.map(family => {
            const selected = family.key === preferences.fontFamily;
            return (
              <Pressable
                key={family.key}
                onPress={() => {
                  haptics.select();
                  updatePreference('fontFamily', family.key);
                }}
                style={({ pressed }) => [
                  styles.fontRow,
                  {
                    backgroundColor: selected ? theme.accentSoft : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={styles.flex}>
                  {/* Rendered in the font it selects, so the choice is obvious. */}
                  <Text
                    style={[
                      styles.fontSample,
                      family.regular
                        ? { fontFamily: family.regular }
                        : { fontWeight: '400' },
                      { color: theme.title },
                    ]}
                  >
                    {family.label}
                  </Text>
                  <Text style={[typography.meta, { color: theme.muted }]}>
                    {family.hint}
                  </Text>
                </View>

                {selected && (
                  <Animated.View entering={motion.when(FadeIn.duration(150))}>
                    <FontAwesome name="check-circle" size={19} color={theme.accent} />
                  </Animated.View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Text size">
        <Segmented
          options={FONT_SIZES}
          value={preferences.fontSize}
          onChange={size => updatePreference('fontSize', size)}
          renderLabel={(option, selected) => (
            <Text
              style={{
                // Scale the label itself so the control previews its effect.
                fontSize: 11 + option.scale * 5,
                fontWeight: selected ? '700' : '500',
                color: selected ? theme.accent : theme.muted,
              }}
            >
              {option.label}
            </Text>
          )}
        />
      </Section>

      <Section title="Text colour" subtitle="Each colour adapts to light and dark mode.">
        <View style={styles.swatches}>
          {TEXT_COLORS.map(swatch => {
            const selected = swatch.key === preferences.textColor;
            const resolved =
              (colorScheme === 'dark' ? swatch.dark : swatch.light) ?? theme.title;

            return (
              <Pressable
                key={swatch.key}
                onPress={() => {
                  haptics.select();
                  updatePreference('textColor', swatch.key);
                }}
                style={styles.swatchWrap}
              >
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: resolved,
                      borderColor: selected ? theme.accent : theme.border,
                      borderWidth: selected ? 3 : 1,
                    },
                  ]}
                >
                  {swatch.key === 'default' && (
                    <FontAwesome name="magic" size={13} color={theme.background} />
                  )}
                </View>
                <Text
                  style={[
                    typography.meta,
                    { color: selected ? theme.accent : theme.muted },
                  ]}
                  numberOfLines={1}
                >
                  {swatch.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Motion & feedback">
        <View style={styles.switchGroup}>
          <SwitchRow
            label="Animations"
            hint={
              motion.systemReduced
                ? 'Turned off by your device’s Reduce Motion setting.'
                : 'Pulses, screen transitions and list reordering.'
            }
            value={preferences.animations}
            disabled={motion.systemReduced}
            onChange={next => {
              haptics.toggle();
              updatePreference('animations', next);
            }}
          />

          <SwitchRow
            label="Haptics"
            hint="Vibrate on taps, pins and deletes."
            value={preferences.haptics}
            onChange={next => {
              updatePreference('haptics', next);
              if (next) haptics.toggle();
            }}
          />
        </View>
      </Section>

      <Pressable
        onPress={() => {
          haptics.warning();
          resetPreferences();
        }}
        style={({ pressed }) => [
          styles.reset,
          { borderColor: theme.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <FontAwesome name="undo" size={14} color={theme.muted} />
        <Text style={[typography.meta, { color: theme.muted }]}>
          Reset to defaults
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  flex: {
    flex: 1,
  },
  preview: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  previewTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  segmented: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  fontList: {
    gap: spacing.sm,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  fontSample: {
    fontSize: 19,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchWrap: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 64,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchGroup: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});

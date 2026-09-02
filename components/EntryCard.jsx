import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useTheme } from '@/context/ThemeContext';
import { elevation, radius, spacing } from '@/components/constants/themeColor';
import RichText from '@/components/ui/RichText';
import { useMotion } from '@/hooks/useMotion';

/**
 * One row in a list. Deliberately dumb — the parent supplies an optional
 * leading control (the to-do checkbox) and a footer (the reminder schedule
 * chip), so notes, to-dos and reminders all share this component.
 */
function EntryCard({
  title,
  body,
  spans,
  pinned,
  dimmed,
  struck,
  leading,
  footer,
  onPress,
  onLongPress,
  selectionMode,
  selected,
  bodyLines = 3,
}) {
  const { theme, typography } = useTheme();
  const motion = useMotion();

  const strikeStyle = struck ? { textDecorationLine: 'line-through' } : null;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={({ pressed }) => [
        styles.card,
        elevation(theme, 1),
        {
          backgroundColor: selected ? theme.accentSoft : theme.surface,
          borderColor: selected || pinned ? theme.accent : theme.border,
          borderWidth: selected ? 2 : 1,
        },
        dimmed && { opacity: 0.55 },
        pressed && { transform: [{ scale: 0.985 }], opacity: 0.9 },
      ]}
    >
      {pinned && !selectionMode && (
        <View style={[styles.pinFlag, { backgroundColor: theme.accent }]}>
          <FontAwesome name="thumb-tack" size={10} color={theme.onAccent} />
        </View>
      )}

      <View style={styles.header}>
        {selectionMode ? (
          <Animated.View entering={motion.when(FadeIn.duration(150))}>
            <View
              style={[
                styles.selectDot,
                {
                  backgroundColor: selected ? theme.accent : 'transparent',
                  borderColor: selected ? theme.accent : theme.border,
                },
              ]}
            >
              {selected && (
                <FontAwesome name="check" size={11} color={theme.onAccent} />
              )}
            </View>
          </Animated.View>
        ) : (
          leading
        )}

        <Text
          style={[typography.title, styles.title, strikeStyle]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {pinned && selectionMode && (
          <FontAwesome name="thumb-tack" size={12} color={theme.accent} />
        )}
      </View>

      {!!body && (
        // Previews keep inline formatting, but headings are clamped so a note
        // that opens with an H1 cannot blow the card open.
        <RichText
          text={body}
          spans={spans}
          scaleCap={1.15}
          numberOfLines={bodyLines}
          style={[styles.body, strikeStyle]}
        />
      )}

      {footer}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  pinFlag: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: radius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    // Leave room for the pin flag.
    paddingRight: spacing.xl,
  },
  title: {
    flex: 1,
  },
  body: {
    marginTop: spacing.xs,
  },
  selectDot: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Rows re-render only when their own data changes, not on every list update.
export default memo(EntryCard);

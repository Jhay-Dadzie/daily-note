import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Speech from 'expo-speech';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/components/constants/themeColor';
import { useHaptics } from '@/hooks/useHaptics';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useMotion } from '@/hooks/useMotion';
import FormatToolbar from '@/components/ui/FormatToolbar';
import RichText, { useSegmentStyle } from '@/components/ui/RichText';
import {
  MARKS,
  applyMark,
  diffRange,
  marksInRange,
  remapSpans,
  setMark,
  toSegments,
} from '@/components/richText';

const EMPTY_SPANS = [];

/**
 * Shared create/read/edit surface for notes, to-dos and reminders.
 *
 * The body supports inline formatting. Text stays a plain string; formatting
 * rides alongside it as spans (see `components/richText.js`), so read-aloud,
 * search and previously saved entries all keep working untouched.
 */
export default function EntryEditor({
  titleValue,
  onChangeTitle,
  bodyValue,
  onChangeBody,
  spansValue = EMPTY_SPANS,
  onChangeSpans,
  titlePlaceholder = 'Title',
  bodyPlaceholder = 'Start writing…',
  /** null on create screens, which are always editable. */
  editable,
  onToggleEditable,
  onSave,
  saveLabel = 'Save',
  header,
  autoFocus = false,
}) {
  const { theme, typography } = useTheme();
  const haptics = useHaptics();
  const styleForSegment = useSegmentStyle();
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  const motion = useMotion();

  const [speaking, setSpeaking] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  /** Formatting armed for the next characters typed at a collapsed cursor. */
  const [pendingMarks, setPendingMarks] = useState({});
  /** Set only right after a toolbar action, to put the cursor back. */
  const [restoreSelection, setRestoreSelection] = useState(undefined);
  /**
   * Which field was focused last. Only set on focus, never cleared on blur —
   * tapping a toolbar button can blur the input, and the bar must not vanish
   * out from under the press.
   */
  const [activeField, setActiveField] = useState(null);

  const isEditing = editable ?? true;
  const richEnabled = typeof onChangeSpans === 'function';

  // Never leave speech running when the screen goes away.
  useEffect(() => () => Speech.stop(), []);

  const stopSpeech = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);

  const toggleSpeech = useCallback(async () => {
    haptics.tap();

    if (speaking) {
      stopSpeech();
      return;
    }

    // Read the plain string — formatting is presentational only.
    const text = [titleValue, bodyValue].filter(Boolean).join('. ').trim();
    if (!text) return;

    setSpeaking(true);
    Speech.speak(text, {
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [bodyValue, haptics, speaking, stopSpeech, titleValue]);

  /** Keep spans anchored as the text changes, and apply any armed formatting. */
  const handleChangeBody = useCallback(
    next => {
      if (richEnabled) {
        let nextSpans = remapSpans(spansValue, bodyValue, next);

        const { start, insertedLength } = diffRange(bodyValue, next);
        if (insertedLength > 0) {
          Object.entries(pendingMarks).forEach(([mark, value]) => {
            nextSpans = setMark(nextSpans, next, mark, value, {
              start,
              end: start + insertedLength,
            });
          });
        }

        onChangeSpans(nextSpans);
      }

      onChangeBody(next);
    },
    [bodyValue, onChangeBody, onChangeSpans, pendingMarks, richEnabled, spansValue]
  );

  const handleSelectionChange = useCallback(event => {
    const next = event.nativeEvent.selection;
    setSelection(next);
    setRestoreSelection(undefined);

    // Selecting a range means the toolbar should describe that range, so any
    // armed formatting is no longer relevant.
    if (next.end > next.start) setPendingMarks({});
  }, []);

  const handleApplyFormat = useCallback(
    (mark, value) => {
      const hasRange = selection.end > selection.start;

      // Headings act on whole lines, so they work with just a cursor.
      if (hasRange || mark === MARKS.LEVEL) {
        onChangeSpans(applyMark(spansValue, bodyValue, mark, value, selection));
        // Applying formatting must not drop the user's selection.
        setRestoreSelection({ ...selection });
        return;
      }

      // Collapsed cursor: arm the mark for whatever gets typed next.
      setPendingMarks(current => {
        const next = { ...current };
        if (mark === MARKS.COLOR) {
          if (value === 'default') delete next[mark];
          else next[mark] = value;
        } else if (next[mark]) {
          delete next[mark];
        } else {
          next[mark] = value;
        }
        return next;
      });
    },
    [bodyValue, onChangeSpans, selection, spansValue]
  );

  const activeMarks = useMemo(
    () => ({
      ...marksInRange(spansValue, selection.start, selection.end),
      ...pendingMarks,
    }),
    [pendingMarks, selection.end, selection.start, spansValue]
  );

  const segments = useMemo(
    () => toSegments(bodyValue, spansValue),
    [bodyValue, spansValue]
  );

  // Only drive the input through children once there is formatting to show;
  // plain notes stay on the simpler, more reliable `value` path.
  const useStyledChildren = richEnabled && spansValue.length > 0;

  const wordCount = bodyValue.trim() ? bodyValue.trim().split(/\s+/).length : 0;

  /**
   * Reserve exactly the keyboard's height at the bottom of the screen, so the
   * format toolbar and the save button sit directly on top of it. When the
   * keyboard is down, fall back to the safe-area inset instead.
   */
  const openDuration = motion.duration(220);
  const closeDuration = motion.duration(180);

  const keyboardInset = useAnimatedStyle(
    () => ({
      paddingBottom: withTiming(Math.max(keyboardHeight, insets.bottom), {
        duration: keyboardHeight > 0 ? openDuration : closeDuration,
      }),
    }),
    [closeDuration, insets.bottom, keyboardHeight, openDuration]
  );

  const inputProps = {
    onChangeText: handleChangeBody,
    onSelectionChange: handleSelectionChange,
    onFocus: () => setActiveField('body'),
    selection: restoreSelection,
    placeholder: bodyPlaceholder,
    placeholderTextColor: theme.muted,
    cursorColor: theme.accent,
    selectionColor: theme.accent,
    multiline: true,
    textAlignVertical: 'top',
    style: [typography.body, styles.bodyInput],
  };

  return (
    // The bottom inset is handled by `keyboardInset`, so the safe area only
    // covers the sides here.
    <Animated.View
      style={[styles.flex, { backgroundColor: theme.background }, keyboardInset]}
    >
      <SafeAreaView edges={['left', 'right']} style={styles.flex}>
        {/* Mode pill — only rendered for existing entries. */}
        {onToggleEditable && (
          <Pressable
            onPress={() => {
              haptics.toggle();
              // Entering edit mode silences read-aloud.
              stopSpeech();
              onToggleEditable();
            }}
            style={({ pressed }) => [
              styles.modePill,
              {
                backgroundColor: isEditing ? theme.accent : theme.surfaceAlt,
                borderColor: isEditing ? theme.accent : theme.border,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <FontAwesome
              name={isEditing ? 'pencil' : 'book'}
              size={12}
              color={isEditing ? theme.onAccent : theme.icon}
            />
            <Text
              style={[
                typography.meta,
                { color: isEditing ? theme.onAccent : theme.body },
              ]}
            >
              {isEditing ? 'Editing' : 'Reading'}
            </Text>
          </Pressable>
        )}

        {header}

        <TextInput
          value={titleValue}
          onChangeText={onChangeTitle}
          placeholder={titlePlaceholder}
          placeholderTextColor={theme.muted}
          cursorColor={theme.accent}
          selectionColor={theme.accent}
          editable={isEditing}
          autoFocus={autoFocus}
          onFocus={() => setActiveField('title')}
          style={[typography.display, styles.titleInput]}
        />

        {isEditing ? (
          useStyledChildren ? (
            // Children and `value` are mutually exclusive on TextInput, so the
            // text is supplied entirely by these styled segments.
            <TextInput {...inputProps}>
              <Text style={typography.body}>
                {segments.map((segment, index) => (
                  <Text
                    key={`${segment.start}-${index}`}
                    style={styleForSegment(segment.marks)}
                  >
                    {segment.text}
                  </Text>
                ))}
              </Text>
            </TextInput>
          ) : (
            <TextInput {...inputProps} value={bodyValue} />
          )
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.readerContent}
            showsVerticalScrollIndicator={false}
          >
            <RichText text={bodyValue} spans={spansValue} />
          </ScrollView>
        )}

        {/* Formatting targets the body, so the bar only appears for the body. */}
        {isEditing && richEnabled && activeField === 'body' && (
          <FormatToolbar
            activeMarks={activeMarks}
            onApply={handleApplyFormat}
            hasSelection={selection.end > selection.start}
          />
        )}

        <View style={[styles.actionBar, { borderTopColor: theme.border }]}>
          <Text style={[typography.meta, styles.count]}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </Text>

          {!isEditing && (
            <Pressable
              onPress={toggleSpeech}
              style={({ pressed }) => [
                styles.secondaryButton,
                { borderColor: speaking ? theme.accent : theme.border },
                speaking && { backgroundColor: theme.accentSoft },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Animated.View
                key={String(speaking)}
                entering={motion.when(FadeIn.duration(150))}
              >
                <FontAwesome
                  name={speaking ? 'stop' : 'volume-up'}
                  size={15}
                  color={speaking ? theme.accent : theme.icon}
                />
              </Animated.View>
              <Text
                style={[typography.meta, { color: speaking ? theme.accent : theme.body }]}
              >
                {speaking ? 'Stop' : 'Read aloud'}
              </Text>
            </Pressable>
          )}

          {isEditing && (
            <Pressable
              onPress={() => {
                haptics.success();
                onSave();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.accent },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <FontAwesome name="check" size={15} color={theme.onAccent} />
              <Text style={[typography.button, { color: theme.onAccent }]}>
                {saveLabel}
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  titleInput: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  bodyInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  readerContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  count: {
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

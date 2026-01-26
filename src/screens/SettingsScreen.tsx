import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

const APP_VERSION = '1.0.0';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Apparence */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>APPARENCE</Text>
        </View>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Mode sombre</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  {isDark ? 'Activé' : 'Désactivé'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#F4F4F5'}
            />
          </View>
        </View>

        {/* Section À propos */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>À PROPOS</Text>
        </View>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={[styles.settingRow, styles.settingRowBorder, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📱</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Version</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{APP_VERSION}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🎮</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Pokémon</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>1025 Pokémon disponibles</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => openLink('https://tyradex.vercel.app/')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🌐</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>API Tyradex</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Source des données</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Développeur */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>DÉVELOPPEUR</Text>
        </View>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={[styles.settingRow, styles.settingRowBorder, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>👨‍💻</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Développé par</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Mohammed ELA</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => openLink('https://github.com/Mohammed-ela')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🐙</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>GitHub</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>@Mohammed-ela</Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Légal */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>LÉGAL</Text>
        </View>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={[styles.settingRow, styles.settingRowBorder, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📄</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Licence</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Application non officielle</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>©️</Text>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Pokémon</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  © Nintendo, Game Freak, Creatures
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Pokemania v{APP_VERSION}
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Fait avec ❤️ pour les fans de Pokémon
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SettingsScreen;

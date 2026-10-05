import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const STORAGE_KEY = 'fitness-tracker-data-v2';
const GOALS_KEY = 'fitness-tracker-goals-v2';

const initialData = [
  { date: '2026-09-29', steps: 8210, distance: 5.6, calories: 420, activeMinutes: 42 },
  { date: '2026-09-30', steps: 10420, distance: 7.1, calories: 560, activeMinutes: 55 },
  { date: '2026-10-01', steps: 9500, distance: 6.3, calories: 490, activeMinutes: 48 },
  { date: '2026-10-02', steps: 12050, distance: 8.4, calories: 610, activeMinutes: 63 },
  { date: '2026-10-03', steps: 8800, distance: 6.0, calories: 470, activeMinutes: 45 },
  { date: '2026-10-04', steps: 13500, distance: 9.6, calories: 700, activeMinutes: 72 },
  { date: '2026-10-05', steps: 11250, distance: 7.8, calories: 630, activeMinutes: 58 },
];

const defaultGoals = {
  steps: 10000,
  distance: 5,
  calories: 2000,
  activeMinutes: 60,
};

const getTodayIso = () => new Date().toISOString().split('T')[0];

const formatNumber = (value) => Number(value || 0).toLocaleString('fr-FR');

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [entries, setEntries] = useState(initialData);
  const [goals, setGoals] = useState(defaultGoals);
  const [steps, setSteps] = useState('0');
  const [distance, setDistance] = useState('0');
  const [calories, setCalories] = useState('0');
  const [activeMinutes, setActiveMinutes] = useState('0');
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [tempGoals, setTempGoals] = useState(defaultGoals);

  const today = getTodayIso();

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem(STORAGE_KEY);
      const savedGoals = await AsyncStorage.getItem(GOALS_KEY);

      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }

      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
        setTempGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.log('Erreur chargement AsyncStorage:', error);
    }
  };

  const persistEntries = async (newEntries) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const persistGoals = async (newGoals) => {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
    setGoals(newGoals);
  };

  const todayEntry = useMemo(() => {
    const found = entries.find((item) => item.date === today);
    if (found) return found;
    return { steps: 0, distance: 0, calories: 0, activeMinutes: 0 };
  }, [entries, today]);

  const weekStats = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const existing = entries.find((item) => item.date === iso);
      result.push({
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
        steps: existing ? existing.steps : 0,
        distance: existing ? existing.distance : 0,
      });
    }
    return result;
  }, [entries]);

  const maxWeekSteps = Math.max(...weekStats.map((d) => d.steps), 10000);

  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const item of sorted) {
      if (item.steps >= goals.steps * 0.5) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [entries, goals]);

  const monthSummary = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let total = { steps: 0, distance: 0, calories: 0, activeMinutes: 0 };
    let daysCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const match = entries.find((item) => item.date === date);
      if (match) {
        total.steps += match.steps;
        total.distance += match.distance;
        total.calories += match.calories;
        total.activeMinutes += match.activeMinutes;
        daysCount += 1;
      }
    }

    return {
      total,
      daysCount,
      avgSteps: daysCount ? Math.round(total.steps / daysCount) : 0,
    };
  }, [entries]);

  const goalProgress = useMemo(() => ({
    steps: Math.min(100, Math.round((todayEntry.steps / goals.steps) * 100)),
    distance: Math.min(100, Math.round((todayEntry.distance / goals.distance) * 100)),
    calories: Math.min(100, Math.round((todayEntry.calories / goals.calories) * 100)),
    activeMinutes: Math.min(100, Math.round((todayEntry.activeMinutes / goals.activeMinutes) * 100)),
  }), [todayEntry, goals]);

  const saveActivity = async () => {
    if (!steps || !distance || !calories || !activeMinutes) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const newEntry = {
      date: today,
      steps: Number(steps),
      distance: Number(distance),
      calories: Number(calories),
      activeMinutes: Number(activeMinutes),
    };

    const idx = entries.findIndex((entry) => entry.date === today);
    let updated = [...entries];

    if (idx >= 0) updated[idx] = newEntry;
    else updated = [newEntry, ...updated];

    updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    await persistEntries(updated);
    setSteps('0');
    setDistance('0');
    setCalories('0');
    setActiveMinutes('0');
    Alert.alert('Succès', 'Activité enregistrée.');
  };

  const saveGoals = async () => {
    await persistGoals(tempGoals);
    setShowGoalsModal(false);
    Alert.alert('Succès', 'Objectifs enregistrés.');
  };

  const resetData = () => {
    Alert.alert('Réinitialiser', 'Remettre les valeurs d’exemple ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          await persistEntries(initialData);
          await persistGoals(defaultGoals);
          setTempGoals(defaultGoals);
        },
      },
    ]);
  };

  const getBarHeight = (value, max) => Math.max(18, (value / max) * 150);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fb" />

      {tab === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mon suivi</Text>
            <TouchableOpacity
              style={styles.goalBtn}
              onPress={() => {
                setTempGoals(goals);
                setShowGoalsModal(true);
              }}
            >
              <Text style={styles.goalBtnText}>Objectifs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.green]}>
              <Text style={styles.label}>Pas</Text>
              <Text style={styles.value}>{formatNumber(todayEntry.steps)}</Text>
              <Text style={styles.caption}>/{formatNumber(goals.steps)}</Text>
            </View>

            <View style={[styles.summaryCard, styles.blue]}>
              <Text style={styles.label}>Km</Text>
              <Text style={styles.value}>{Number(todayEntry.distance || 0).toFixed(1)}</Text>
              <Text style={styles.caption}>/{goals.distance} km</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.purple]}>
              <Text style={styles.label}>Calories</Text>
              <Text style={styles.value}>{formatNumber(todayEntry.calories)}</Text>
              <Text style={styles.caption}>/{formatNumber(goals.calories)}</Text>
            </View>

            <View style={[styles.summaryCard, styles.orange]}>
              <Text style={styles.label}>Actives</Text>
              <Text style={styles.value}>{formatNumber(todayEntry.activeMinutes)}</Text>
              <Text style={styles.caption}>/{formatNumber(goals.activeMinutes)} min</Text>
            </View>
          </View>

          <View style={styles.statsPanel}>
            <Text style={styles.sectionTitle}>Progrès</Text>
            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>Pas</Text>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${goalProgress.steps}%` }]} /></View>
            </View>
            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>Distance</Text>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${goalProgress.distance}%` }]} /></View>
            </View>
            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>Calories</Text>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${goalProgress.calories}%` }]} /></View>
            </View>
            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>Minutes actives</Text>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${goalProgress.activeMinutes}%` }]} /></View>
            </View>
          </View>

          <View style={styles.chartPanel}>
            <Text style={styles.sectionTitle}>7 derniers jours</Text>
            <View style={styles.chartWrap}>
              {weekStats.map((day, index) => (
                <View key={index} style={styles.barGroup}>
                  <View style={[styles.barVisual, { height: getBarHeight(day.steps, maxWeekSteps) }]} />
                  <Text style={styles.barLabel}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.quickStatsPanel}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Série</Text>
              <Text style={styles.quickStatValue}>{streak} jours</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Moy. / jour</Text>
              <Text style={styles.quickStatValue}>{formatNumber(monthSummary.avgSteps)} pas</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Mois</Text>
              <Text style={styles.quickStatValue}>{monthSummary.daysCount} jours</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {tab === 'add' && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Ajouter une activité</Text>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} value={today} editable={false} />

            <Text style={styles.label}>Nombre de pas</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={steps}
              onChangeText={setSteps}
              placeholder="Ex: 8500"
            />

            <Text style={styles.label}>Kilométrage (km)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
              placeholder="Ex: 5.5"
            />

            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
              placeholder="Ex: 450"
            />

            <Text style={styles.label}>Minutes actives</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={activeMinutes}
              onChangeText={setActiveMinutes}
              placeholder="Ex: 45"
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={saveActivity}>
              <Text style={styles.primaryBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {tab === 'history' && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Historique</Text>

          {entries.map((entry, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.historyDate}> {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</Text>
              <View style={styles.historyGrid}>
                <View style={styles.historyItem}><Text style={styles.historySmall}>Pas</Text><Text style={styles.historyValue}>{formatNumber(entry.steps)}</Text></View>
                <View style={styles.historyItem}><Text style={styles.historySmall}>Km</Text><Text style={styles.historyValue}>{Number(entry.distance || 0).toFixed(1)}</Text></View>
                <View style={styles.historyItem}><Text style={styles.historySmall}>Calories</Text><Text style={styles.historyValue}>{formatNumber(entry.calories)}</Text></View>
                <View style={styles.historyItem}><Text style={styles.historySmall}>Actives</Text><Text style={styles.historyValue}>{formatNumber(entry.activeMinutes)} min</Text></View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.secondaryBtn} onPress={resetData}>
            <Text style={styles.secondaryBtnText}>Réinitialiser</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={showGoalsModal} transparent animationType="slide">
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Objectifs personnalisés</Text>

            <Text style={styles.label}>Pas</Text>
            <TextInput
              style={styles.input}
              value={String(tempGoals.steps)}
              keyboardType="numeric"
              onChangeText={(text) => setTempGoals({ ...tempGoals, steps: Number(text || 0) })}
            />

            <Text style={styles.label}>Distance (km)</Text>
            <TextInput
              style={styles.input}
              value={String(tempGoals.distance)}
              keyboardType="decimal-pad"
              onChangeText={(text) => setTempGoals({ ...tempGoals, distance: Number(text || 0) })}
            />

            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              value={String(tempGoals.calories)}
              keyboardType="numeric"
              onChangeText={(text) => setTempGoals({ ...tempGoals, calories: Number(text || 0) })}
            />

            <Text style={styles.label}>Minutes actives</Text>
            <TextInput
              style={styles.input}
              value={String(tempGoals.activeMinutes)}
              keyboardType="numeric"
              onChangeText={(text) => setTempGoals({ ...tempGoals, activeMinutes: Number(text || 0) })}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={saveGoals}>
              <Text style={styles.primaryBtnText}>Sauvegarder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowGoalsModal(false)}>
              <Text style={styles.secondaryBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'dashboard' && styles.tabBtnActive]} onPress={() => setTab('dashboard')}>
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabLabel, tab === 'dashboard' && styles.tabLabelActive]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tabBtn, tab === 'add' && styles.tabBtnActive]} onPress={() => setTab('add')}>
          <Text style={styles.tabIcon}>➕</Text>
          <Text style={[styles.tabLabel, tab === 'add' && styles.tabLabelActive]}>Ajouter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]} onPress={() => setTab('history')}>
          <Text style={styles.tabIcon}>📜</Text>
          <Text style={[styles.tabLabel, tab === 'history' && styles.tabLabelActive]}>Historique</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fb' },
  container: { padding: 16, paddingBottom: 110 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '800', color: '#112033' },
  goalBtn: { backgroundColor: '#3d8bfd', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  goalBtnText: { color: '#fff', fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryCard: { width: '48%', padding: 16, borderRadius: 18 },
  green: { backgroundColor: '#eafaf2' },
  blue: { backgroundColor: '#edf4ff' },
  purple: { backgroundColor: '#f4ebff' },
  orange: { backgroundColor: '#fff3de' },
  label: { color: '#4d5f78', fontWeight: '600', fontSize: 12 },
  value: { color: '#112033', fontSize: 26, fontWeight: '800', marginTop: 6 },
  caption: { color: '#63758d', fontSize: 11, marginTop: 4 },
  statsPanel: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 8, marginBottom: 16 },
  sectionTitle: { color: '#112033', fontWeight: '800', fontSize: 16, marginBottom: 10 },
  progressBlock: { marginBottom: 10 },
  progressLabel: { color: '#4d5f78', fontSize: 12, fontWeight: '600', marginBottom: 5 },
  progressBar: { height: 8, backgroundColor: '#e8eef7', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3d8bfd', borderRadius: 10 },
  chartPanel: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16 },
  chartWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180 },
  barGroup: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  barVisual: { width: '70%', minHeight: 18, backgroundColor: '#3d8bfd', borderRadius: 10, marginBottom: 6 },
  barLabel: { color: '#61758c', fontSize: 10, textTransform: 'capitalize' },
  quickStatsPanel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  quickStat: { backgroundColor: '#fff', flex: 1, marginHorizontal: 4, borderRadius: 14, padding: 12, alignItems: 'center' },
  quickStatLabel: { color: '#63758d', fontSize: 11 },
  quickStatValue: { color: '#112033', fontWeight: '700', fontSize: 14, marginTop: 4 },
  formBlock: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  input: { backgroundColor: '#f8fafd', borderWidth: 1, borderColor: '#dfeaf5', borderRadius: 12, padding: 12, color: '#112033', marginBottom: 12 },
  primaryBtn: { backgroundColor: '#3d8bfd', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { backgroundColor: '#ff6b6b', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { color: '#fff', fontWeight: '700' },
  historyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  historyDate: { color: '#112033', fontWeight: '700', marginBottom: 10, textTransform: 'capitalize' },
  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  historyItem: { width: '48%', marginBottom: 8 },
  historySmall: { color: '#697e93', fontSize: 11, fontWeight: '600' },
  historyValue: { color: '#112033', fontWeight: '700', fontSize: 14 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9eef4' },
  tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBtnActive: { borderTopWidth: 3, borderTopColor: '#3d8bfd' },
  tabIcon: { fontSize: 24 },
  tabLabel: { fontSize: 11, color: '#667a8d' },
  tabLabelActive: { color: '#3d8bfd', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 30 },
  modalTitle: { color: '#112033', fontSize: 24, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
});

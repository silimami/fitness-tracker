import React, { useMemo, useState } from 'react';
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
} from 'react-native';

const initialData = [
  { date: '2026-09-29', steps: 8210, distance: 5.6, calories: 420, activeMinutes: 42 },
  { date: '2026-09-30', steps: 10420, distance: 7.1, calories: 560, activeMinutes: 55 },
  { date: '2026-10-01', steps: 9500, distance: 6.3, calories: 490, activeMinutes: 48 },
  { date: '2026-10-02', steps: 12050, distance: 8.4, calories: 610, activeMinutes: 63 },
  { date: '2026-10-03', steps: 8800, distance: 6.0, calories: 470, activeMinutes: 45 },
  { date: '2026-10-04', steps: 13500, distance: 9.6, calories: 700, activeMinutes: 72 },
];

const getTodayIso = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [entries, setEntries] = useState(initialData);
  const [steps, setSteps] = useState('0');
  const [distance, setDistance] = useState('0');
  const [calories, setCalories] = useState('0');
  const [activeMinutes, setActiveMinutes] = useState('0');
  const today = getTodayIso();

  const todayEntry = useMemo(() => {
    const found = entries.find((item) => item.date === today);
    if (found) return found;
    return { steps: 0, distance: 0, calories: 0, activeMinutes: 0 };
  }, [entries, today]);

  const saveActivity = () => {
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

    if (idx >= 0) {
      updated[idx] = newEntry;
    } else {
      updated = [newEntry, ...updated];
    }

    updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(updated);
    setSteps('0');
    setDistance('0');
    setCalories('0');
    setActiveMinutes('0');
    Alert.alert('Succès', 'Activité enregistrée.');
  };

  const resetData = () => {
    Alert.alert('Réinitialiser', 'Voulez-vous remettre les valeurs d’exemple ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', onPress: () => setEntries(initialData) },
    ]);
  };

  const chartData = useMemo(() => {
    const lastDays = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const existing = entries.find((item) => item.date === iso);
      lastDays.push({
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
        value: existing ? existing.steps : 0,
      });
    }
    return lastDays;
  }, [entries]);

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 10000);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fb" />

      {tab === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Suivi de ma forme</Text>

          <View style={styles.grid}>
            <View style={[styles.card, styles.green]}>
              <Text style={styles.label}>Pas</Text>
              <Text style={styles.value}>{todayEntry.steps}</Text>
              <Text style={styles.small}>Objectif: 10 000</Text>
            </View>

            <View style={[styles.card, styles.blue]}>
              <Text style={styles.label}>Kilométrage</Text>
              <Text style={styles.value}>{todayEntry.distance.toFixed(1)} km</Text>
              <Text style={styles.small}>Objectif: 5 km</Text>
            </View>

            <View style={[styles.card, styles.purple]}>
              <Text style={styles.label}>Calories</Text>
              <Text style={styles.value}>{todayEntry.calories}</Text>
              <Text style={styles.small}>Brûlées</Text>
            </View>

            <View style={[styles.card, styles.orange]}>
              <Text style={styles.label}>Minutes actives</Text>
              <Text style={styles.value}>{todayEntry.activeMinutes}</Text>
              <Text style={styles.small}>Cette journée</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>7 derniers jours</Text>
            <View style={styles.chartWrap}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.barGroup}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${Math.max(18, (item.value / maxChartValue) * 100)}%` },
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {tab === 'add' && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Ajouter une activité</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Date</Text>
            <TextInput value={today} editable={false} style={styles.input} />

            <Text style={styles.label}>Nombre de pas</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={steps}
              onChangeText={setSteps}
              placeholder="0"
            />

            <Text style={styles.label}>Kilométrage (km)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
              placeholder="0"
            />

            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
              placeholder="0"
            />

            <Text style={styles.label}>Minutes actives</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={activeMinutes}
              onChangeText={setActiveMinutes}
              placeholder="0"
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
              <Text style={styles.historyDate}>
                {new Date(entry.date).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.historyText}>Pas: {entry.steps}</Text>
              <Text style={styles.historyText}>Distance: {entry.distance.toFixed(1)} km</Text>
              <Text style={styles.historyText}>Calories: {entry.calories}</Text>
              <Text style={styles.historyText}>Activité: {entry.activeMinutes} min</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.secondaryBtn} onPress={resetData}>
            <Text style={styles.secondaryBtnText}>Réinitialiser</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'dashboard' && styles.tabButtonActive]}
          onPress={() => setTab('dashboard')}
        >
          <Text style={[styles.tabText, tab === 'dashboard' && styles.tabTextActive]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'add' && styles.tabButtonActive]}
          onPress={() => setTab('add')}
        >
          <Text style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>Ajouter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'history' && styles.tabButtonActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Historique</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#112033',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    minHeight: 140,
    justifyContent: 'center',
  },
  green: { backgroundColor: '#eafaf2' },
  blue: { backgroundColor: '#edf4ff' },
  purple: { backgroundColor: '#f4ecff' },
  orange: { backgroundColor: '#fff3df' },
  label: {
    fontSize: 13,
    color: '#4d5f78',
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#112033',
    marginBottom: 6,
  },
  small: {
    fontSize: 12,
    color: '#61758c',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#112033',
    marginBottom: 14,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
  },
  barGroup: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    minHeight: 18,
    backgroundColor: '#3d8bfd',
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#61758c',
    textTransform: 'capitalize',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe9f4',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#112033',
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: '#3d8bfd',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3d8bfd',
  },
  historyDate: {
    color: '#112033',
    fontWeight: '700',
    marginBottom: 6,
  },
  historyText: {
    color: '#4d5f78',
    fontSize: 13,
    marginBottom: 3,
  },
  secondaryBtn: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e6edf5',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    borderTopWidth: 3,
    borderTopColor: '#3d8bfd',
  },
  tabText: {
    fontSize: 13,
    color: '#6d7c8d',
  },
  tabTextActive: {
    color: '#3d8bfd',
    fontWeight: '700',
  },
});

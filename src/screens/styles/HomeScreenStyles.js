import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#2C3E50',
  },
  successBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  accentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  warningBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  statLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  primaryText: {
    color: '#2C3E50',
  },
  successText: {
    color: '#27AE60',
  },
  accentText: {
    color: '#3498DB',
  },
  warningText: {
    color: '#F39C12',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default styles;
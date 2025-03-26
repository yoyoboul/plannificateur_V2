import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import TaskCard from '../components/TaskCard';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Configuration de dayjs pour le français
dayjs.locale('fr');

export default function RapportPage() {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ status: {}, zones: {} });
  const [priorityStats, setPriorityStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [highPriorityTasks, setHighPriorityTasks] = useState([]);
  
  // Calculer la date de fin estimée en fonction des tâches restantes
  const calculateEstimatedCompletionDate = () => {
    const remainingTasks = tasks.filter(task => task.statut !== 'Terminé');
    const totalRemainingDuration = remainingTasks.reduce((total, task) => total + task.durée_estimée, 0);
    
    // Estimation avec un rythme moyen de 3 heures par jour
    const hoursPerDay = 3;
    const estimatedDays = Math.ceil(totalRemainingDuration * 8 / hoursPerDay); // 8 heures = 1 journée de travail
    
    return dayjs().add(estimatedDays, 'day');
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/stats'),
        ]);
        
        const [tasksData, statsData] = await Promise.all([
          tasksRes.json(),
          statsRes.json(),
        ]);
        
        setTasks(tasksData);
        setStats(statsData);
        
        // Calculer les statistiques par priorité
        const priorityData = {};
        tasksData.forEach(task => {
          priorityData[task.priorité] = (priorityData[task.priorité] || 0) + 1;
        });
        setPriorityStats(priorityData);
        
        // Filtrer les tâches à priorité élevée non terminées
        const highPriority = tasksData.filter(task => task.priorité === 'Élevée' && task.statut !== 'Terminé');
        setHighPriorityTasks(highPriority);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Préparer les données pour les graphiques
  const prepareChartData = (dataObj) => {
    return Object.entries(dataObj).map(([name, value]) => ({
      name,
      value,
    }));
  };
  
  const statusChartData = prepareChartData(stats.status || {});
  const zoneChartData = prepareChartData(stats.zones || {});
  const priorityChartData = prepareChartData(priorityStats);
  
  // Configuration des couleurs pour les graphiques
  const statusColors = {
    'À faire': theme.palette.error.main,
    'En cours': theme.palette.warning.main,
    'En attente': theme.palette.info.main,
    'Terminé': theme.palette.success.main,
  };
  
  const priorityColors = {
    'Élevée': theme.palette.error.main,
    'Moyenne': theme.palette.warning.main,
    'Basse': theme.palette.info.main,
    'Faible': theme.palette.success.main,
  };
  
  const zoneColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.dark,
  ];
  
  // Calcul du pourcentage d'avancement
  const completedTasks = tasks.filter(task => task.statut === 'Terminé').length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Format des durées
  const formatDuration = (days) => {
    if (days >= 1) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    } else {
      const hours = days * 8; // 8 heures de travail par jour
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
  };
  
  // Calcul du temps restant pour les tâches non terminées
  const remainingTasks = tasks.filter(task => task.statut !== 'Terminé');
  const totalRemainingDuration = remainingTasks.reduce((total, task) => total + task.durée_estimée, 0);
  
  // Projection de la fin des travaux
  const estimatedCompletionDate = calculateEstimatedCompletionDate();
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Rapport d'avancement
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Statistiques détaillées et progression des travaux
          </Typography>
        </Box>
        
        {/* Statistiques globales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progression globale
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={completionPercentage}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {`${Math.round(completionPercentage)}%`}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {`${completedTasks} sur ${totalTasks} tâches terminées`}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Estimation du temps restant:
                  </Typography>
                  <Typography variant="body1">
                    <strong>Durée totale estimée des tâches restantes:</strong> {formatDuration(totalRemainingDuration)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date d'achèvement prévue:</strong> {estimatedCompletionDate.format('D MMMM YYYY')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition par statut
                </Typography>
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={statusColors[entry.name] || theme.palette.grey[500]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Nombre de tâches']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Graphiques détaillés */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tâches par zone
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={zoneChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value) => [value, 'Nombre de tâches']} />
                      <Legend />
                      <Bar dataKey="value" name="Nombre de tâches">
                        {zoneChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={zoneColors[index % zoneColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition par priorité
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {priorityChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={priorityColors[entry.name] || theme.palette.grey[500]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Nombre de tâches']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tâches prioritaires */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Tâches prioritaires à faire
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          {highPriorityTasks.length > 0 ? (
            highPriorityTasks.map((task) => (
              <TaskCard
                key={`${task.zone}-${task.titre}`}
                task={task}
              />
            ))
          ) : (
            <Alert severity="success">
              Aucune tâche à priorité élevée en attente.
            </Alert>
          )}
        </Paper>
        
        {/* Tâches recommandées pour la semaine */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Tâches recommandées pour la semaine
        </Typography>
        <Paper sx={{ p: 3 }}>
          {remainingTasks.length > 0 ? (
            remainingTasks
              .sort((a, b) => {
                // Priorité: Élevée > Moyenne > Basse > Faible
                const priorityOrder = { 'Élevée': 1, 'Moyenne': 2, 'Basse': 3, 'Faible': 4 };
                const priorityDiff = priorityOrder[a.priorité] - priorityOrder[b.priorité];
                
                // À priorité égale, trier par durée (croissante)
                if (priorityDiff === 0) {
                  return a.durée_estimée - b.durée_estimée;
                }
                return priorityDiff;
              })
              .slice(0, 5)
              .map((task) => (
                <TaskCard
                  key={`recommended-${task.zone}-${task.titre}`}
                  task={task}
                />
              ))
          ) : (
            <Alert severity="success">
              Toutes les tâches sont terminées ! Félicitations !
            </Alert>
          )}
        </Paper>
      </motion.div>
    </Layout>
  );
} 
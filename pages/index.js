import { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid,
} from 'recharts';
import { 
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Configuration de dayjs pour le français
dayjs.locale('fr');

// Fonctions utilitaires
const getStatusColor = (status) => {
  switch (status) {
    case 'À faire':
      return 'error';
    case 'En cours':
      return 'warning';
    case 'En attente':
      return 'info';
    case 'Terminé':
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Élevée':
      return 'error';
    case 'Moyenne':
      return 'warning';
    case 'Basse':
      return 'info';
    case 'Faible':
      return 'success';
    default:
      return 'default';
  }
};

// Fonction pour formater la durée
const formatDuration = (days) => {
  if (days >= 1) {
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else {
    const hours = days * 8; // 8 heures de travail par jour
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }
};

export default function Dashboard() {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [stats, setStats] = useState({ status: {}, zones: {} });
  const [todayTasks, setTodayTasks] = useState([]);
  const [priorityTasks, setPriorityTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsTab, setAnalyticsTab] = useState(0);
  const [priorityTab, setPriorityTab] = useState(0);

  // Calculer la date de fin estimée en fonction des tâches restantes
  const calculateEstimatedCompletionDate = () => {
    const remainingTasks = tasks.filter(task => task.statut !== 'Terminé');
    const totalRemainingDuration = remainingTasks.reduce((total, task) => total + task.durée_estimée, 0);
    
    // Estimation avec un rythme moyen de 3 heures par jour
    const hoursPerDay = 3;
    const estimatedDays = Math.ceil(totalRemainingDuration * 8 / hoursPerDay); // 8 heures = 1 journée de travail
    
    return {
      duration: totalRemainingDuration,
      completionDate: dayjs().add(estimatedDays, 'day')
    };
  };

  // Calcul des estimations
  const estimations = calculateEstimatedCompletionDate();
  const totalRemainingDuration = estimations.duration;
  const estimatedCompletionDate = estimations.completionDate;

  useEffect(() => {
    // Charger les tâches, les zones et les statistiques
    const fetchData = async () => {
      try {
        const [tasksRes, zonesRes, statsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/zones'),
          fetch('/api/stats'),
        ]);

        const [tasksData, zonesData, statsData] = await Promise.all([
          tasksRes.json(),
          zonesRes.json(),
          statsRes.json(),
        ]);

        setTasks(tasksData);
        setZones(zonesData);
        setStats(statsData);

        // Filtrer les tâches pour aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todayTasksData = tasksData.filter((task) => {
          if (!task.date_début || !task.date_fin) return false;
          const startDate = new Date(task.date_début).toISOString().split('T')[0];
          const endDate = new Date(task.date_fin).toISOString().split('T')[0];
          return today >= startDate && today <= endDate;
        });
        setTodayTasks(todayTasksData);

        // Filtrer les tâches prioritaires non planifiées
        const priorityTasksData = tasksData.filter((task) => 
          task.priorité === 'Élevée' && 
          task.statut !== 'Terminé' && 
          !task.date_début
        );
        setPriorityTasks(priorityTasksData);

        // Filtrer les tâches à venir (planifiées pour les prochains jours)
        const upcomingTasksData = tasksData.filter((task) => {
          if (!task.date_début) return false;
          const startDate = new Date(task.date_début);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const tomorrow = new Date(todayDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date(todayDate);
          nextWeek.setDate(nextWeek.getDate() + 7);
          return startDate >= tomorrow && startDate <= nextWeek;
        });
        setUpcomingTasks(upcomingTasksData.slice(0, 5)); // Limiter à 5 tâches à venir
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Préparer les données pour les graphiques
  const statusChartData = Object.entries(stats.status || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const zoneChartData = Object.entries(stats.zones || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Couleurs pour les graphiques
  const statusColors = {
    'À faire': theme.palette.error.main,
    'En cours': theme.palette.warning.main,
    'En attente': theme.palette.info.main,
    'Terminé': theme.palette.success.main,
  };

  const zoneColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.dark,
  ];

  // Calcul du pourcentage d'avancement
  const completedTasks = tasks.filter((task) => task.statut === 'Terminé').length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleStatusChange = async (zone, titre, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${zone}/${titre}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.zone === zone && task.titre === titre) {
              return { ...task, statut: newStatus };
            }
            return task;
          })
        );

        // Mettre à jour les statistiques
        const updatedStats = { ...stats };
        const oldStatus = tasks.find((t) => t.zone === zone && t.titre === titre)?.statut;
        if (oldStatus) {
          updatedStats.status[oldStatus] = (updatedStats.status[oldStatus] || 0) - 1;
        }
        updatedStats.status[newStatus] = (updatedStats.status[newStatus] || 0) + 1;
        setStats(updatedStats);

        // Mettre à jour les tâches du jour si nécessaire
        setTodayTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.zone === zone && task.titre === titre) {
              return { ...task, statut: newStatus };
            }
            return task;
          })
        );

        // Mettre à jour les tâches prioritaires si nécessaire
        setPriorityTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.zone === zone && task.titre === titre) {
              return { ...task, statut: newStatus };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleAnalyticsTabChange = (event, newValue) => {
    setAnalyticsTab(newValue);
  };

  const handlePriorityTabChange = (event, newValue) => {
    setPriorityTab(newValue);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de bord
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Vue d'ensemble de vos travaux de rénovation
          </Typography>
        </Box>

        {/* Première rangée: Tâches du jour et Progression globale */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Tâches du jour - Plus grande carte à gauche */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 2, 
              boxShadow: 3,
              position: 'relative',
              overflow: 'visible'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                left: 20, 
                bgcolor: theme.palette.primary.main,
                color: 'white',
                py: 0.5,
                px: 2,
                borderRadius: 2,
                boxShadow: 2,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CalendarIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Aujourd'hui
                </Typography>
              </Box>
              <CardContent sx={{ pt: 3 }}>
                {/* Date et statistiques */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={5}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      height: '100%',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </Typography>
                      <Typography variant="h5">
                        {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        bgcolor: theme.palette.background.paper,
                        p: 1.5,
                        borderRadius: 1,
                        mb: 1
                      }}>
                        <Typography variant="body2">Nombre de tâches:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {todayTasks.length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        bgcolor: theme.palette.background.paper,
                        p: 1.5,
                        borderRadius: 1,
                        mb: 1
                      }}>
                        <Typography variant="body2">Tâches terminées:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {todayTasks.filter(task => task.statut === 'Terminé').length} / {todayTasks.length}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        bgcolor: theme.palette.background.paper,
                        p: 1.5,
                        borderRadius: 1
                      }}>
                        <Typography variant="body2">Temps estimé:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {todayTasks.reduce((acc, task) => acc + task.durée_estimée, 0).toFixed(1)} jours
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Alerte pour tâches prioritaires */}
                {todayTasks.some(task => task.priorité === 'Élevée' && task.statut !== 'Terminé') && (
                  <Box sx={{ 
                    my: 2, 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: theme.palette.error.light,
                    color: theme.palette.error.contrastText
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Tâches prioritaires à faire aujourd'hui!
                    </Typography>
                  </Box>
                )}
                
                {/* Liste des tâches */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Tâches d'aujourd'hui</span>
                  <Chip 
                    label={`${todayTasks.filter(t => t.statut === 'Terminé').length}/${todayTasks.length}`} 
                    color="primary" 
                    size="small"
                  />
                </Typography>
                
                {todayTasks.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1.5,
                      maxHeight: '300px',
                      overflow: 'auto',
                      pr: 1
                    }}>
                      {/* Afficher d'abord les tâches non terminées par priorité */}
                      {[...todayTasks]
                        .sort((a, b) => {
                          // Trier d'abord par statut (non terminé en premier)
                          if (a.statut === 'Terminé' && b.statut !== 'Terminé') return 1;
                          if (a.statut !== 'Terminé' && b.statut === 'Terminé') return -1;
                          
                          // Puis par priorité
                          const priorityOrder = { 'Élevée': 1, 'Moyenne': 2, 'Basse': 3, 'Faible': 4 };
                          return priorityOrder[a.priorité] - priorityOrder[b.priorité];
                        })
                        .map((task) => (
                          <motion.div
                            key={`${task.zone}-${task.titre}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: task.statut === 'Terminé' 
                                  ? theme.palette.success.light + '33' // transparence ajoutée pour les tâches terminées 
                                  : theme.palette.background.paper,
                                boxShadow: task.statut === 'Terminé' ? 0 : 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: `4px solid ${theme.palette[getStatusColor(task.statut)].main}`
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle1" fontWeight={task.statut !== 'Terminé' ? 'medium' : 'normal'}>
                                  {task.titre}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip 
                                    label={task.zone} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ borderRadius: 1 }}
                                  />
                                  <Chip 
                                    label={task.priorité} 
                                    size="small"
                                    color={getPriorityColor(task.priorité)}
                                    sx={{ borderRadius: 1 }}
                                  />
                                </Box>
                              </Box>
                              
                              <Box>
                                <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                                  <Select
                                    value={task.statut}
                                    onChange={(e) => handleStatusChange(task.zone, task.titre, e.target.value)}
                                    sx={{
                                      fontSize: '0.8rem',
                                      height: '32px',
                                    }}
                                  >
                                    <MenuItem value="À faire">À faire</MenuItem>
                                    <MenuItem value="En cours">En cours</MenuItem>
                                    <MenuItem value="En attente">En attente</MenuItem>
                                    <MenuItem value="Terminé">Terminé</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                            </Box>
                          </motion.div>
                        ))
                      }
                    </Box>
                  </motion.div>
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      Aucune tâche planifiée pour aujourd'hui.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rendez-vous dans la section Agenda pour planifier vos tâches.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<CalendarIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => window.location.href = '/agenda'}
                    >
                      Aller à l'agenda
                    </Button>
                  </Box>
                )}
              </CardContent>
              {todayTasks.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <Button 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => window.location.href = '/agenda'}
                    size="small"
                  >
                    Voir l'agenda complet
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Progression globale - Carte plus petite à droite */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 2, 
              boxShadow: 3,
              position: 'relative',
              overflow: 'visible'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                left: 20, 
                bgcolor: theme.palette.success.main,
                color: 'white',
                py: 0.5,
                px: 2,
                borderRadius: 2,
                boxShadow: 2,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Progression
                </Typography>
              </Box>
              <CardContent sx={{ pt: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {`${Math.round(completionPercentage)}%`}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Tâches terminées
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    sx={{ height: 12, borderRadius: 6 }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Typography variant="body2">Tâches terminées:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {completedTasks} / {totalTasks}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Typography variant="body2">Total des zones:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {zones.length}
                  </Typography>
                </Box>

                {/* Estimation du temps restant */}
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
                    Estimation du temps restant
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.primary.lighter || theme.palette.primary.light + '33',
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Durée totale estimée des tâches restantes:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {formatDuration(totalRemainingDuration)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.primary.lighter || theme.palette.primary.light + '33',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Date d'achèvement prévue:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {estimatedCompletionDate.format('D MMMM YYYY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      (dans {estimatedCompletionDate.diff(dayjs(), 'day')} jours)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Deuxième rangée: Tâches prioritaires */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Tâches prioritaires - Carte pleine largeur */}
          <Grid item xs={12}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 2, 
              boxShadow: 3,
              position: 'relative',
              overflow: 'visible'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                left: 20, 
                bgcolor: theme.palette.error.main,
                color: 'white',
                py: 0.5,
                px: 2,
                borderRadius: 2,
                boxShadow: 2,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PriorityHighIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Priorités
                </Typography>
              </Box>
              <CardContent sx={{ pt: 3 }}>
                <Tabs 
                  value={priorityTab} 
                  onChange={handlePriorityTabChange}
                  sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Tâches prioritaires" />
                  <Tab label="Prochaines tâches" />
                </Tabs>
                
                {priorityTab === 0 && (
                  <Box sx={{ maxHeight: '250px', overflow: 'auto' }}>
                    {priorityTasks.length > 0 ? (
                      <Grid container spacing={2}>
                        {priorityTasks.map((task) => (
                          <Grid item xs={12} md={6} key={`priority-${task.zone}-${task.titre}`}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: `4px solid ${theme.palette.error.main}`,
                                height: '100%'
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {task.titre}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip 
                                    label={task.zone} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ borderRadius: 1 }}
                                  />
                                  <Chip 
                                    label={`Durée: ${formatDuration(task.durée_estimée)}`} 
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                  />
                                </Box>
                              </Box>
                              
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => window.location.href = '/agenda'}
                              >
                                Planifier
                              </Button>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" gutterBottom>
                          Aucune tâche prioritaire non planifiée.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                {priorityTab === 1 && (
                  <Box sx={{ maxHeight: '250px', overflow: 'auto' }}>
                    {upcomingTasks.length > 0 ? (
                      <Grid container spacing={2}>
                        {upcomingTasks.map((task) => (
                          <Grid item xs={12} md={6} key={`upcoming-${task.zone}-${task.titre}`}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: `4px solid ${theme.palette.info.main}`,
                                height: '100%'
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {task.titre}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                  <Chip 
                                    label={task.zone} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ borderRadius: 1 }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {dayjs(task.date_début).format('DD/MM/YYYY')}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                                <Select
                                  value={task.statut}
                                  onChange={(e) => handleStatusChange(task.zone, task.titre, e.target.value)}
                                  sx={{
                                    fontSize: '0.8rem',
                                    height: '32px',
                                  }}
                                >
                                  <MenuItem value="À faire">À faire</MenuItem>
                                  <MenuItem value="En cours">En cours</MenuItem>
                                  <MenuItem value="En attente">En attente</MenuItem>
                                  <MenuItem value="Terminé">Terminé</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" gutterBottom>
                          Aucune tâche à venir dans la semaine.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Troisième rangée: Graphiques d'analyse */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              position: 'relative',
              overflow: 'visible'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                left: 20, 
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                py: 0.5,
                px: 2,
                borderRadius: 2,
                boxShadow: 2,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <FilterIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Analyse
                </Typography>
              </Box>
              <CardContent sx={{ pt: 3 }}>
                <Tabs 
                  value={analyticsTab} 
                  onChange={handleAnalyticsTabChange}
                  sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Statuts" />
                  <Tab label="Zones" />
                </Tabs>
                
                {analyticsTab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" gutterBottom align="center">
                        Répartition par statut
                      </Typography>
                      <Box sx={{ height: 250 }}>
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
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom align="center">
                        Détails des statuts
                      </Typography>
                      <Box sx={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statusChartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Bar dataKey="value" name="Nombre de tâches">
                              {statusChartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={statusColors[entry.name] || theme.palette.grey[500]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                  </Grid>
                )}
                
                {analyticsTab === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom align="center">
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
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Nombre de tâches">
                              {zoneChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={zoneColors[index % zoneColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Layout>
  );
} 
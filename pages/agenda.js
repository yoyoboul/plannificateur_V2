import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Event as EventIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import TaskCard from '../components/TaskCard';

// Configuration de dayjs pour le français
dayjs.locale('fr');

// Fonction utilitaire pour obtenir les jours d'un mois
const getDaysInMonth = (year, month) => {
  const date = dayjs().year(year).month(month).startOf('month');
  const daysInMonth = date.daysInMonth();
  const firstDayOfMonth = date.day(); // 0 = dimanche, 1 = lundi, etc.

  // Tableau des jours du mois
  const days = [];
  
  // Ajouter les jours du mois précédent pour compléter la première semaine
  const prevMonth = date.subtract(1, 'month');
  const daysInPrevMonth = prevMonth.daysInMonth();
  const prevMonthStartDay = daysInPrevMonth - firstDayOfMonth + 1;
  
  // Si le premier jour du mois est un lundi (1), alors on ne montre pas les jours du mois précédent
  if (firstDayOfMonth !== 1) {
    // Si le premier jour est dimanche (0), on affiche les 6 jours précédents
    const startDay = firstDayOfMonth === 0 ? prevMonthStartDay + 1 : prevMonthStartDay;
    for (let i = startDay; i <= daysInPrevMonth; i++) {
      days.push({
        date: prevMonth.date(i),
        isCurrentMonth: false,
      });
    }
  }
  
  // Ajouter les jours du mois en cours
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: date.date(i),
      isCurrentMonth: true,
    });
  }
  
  // Ajouter les jours du mois suivant pour compléter la dernière semaine
  const lastDayOfMonth = date.endOf('month').day();
  const nextMonth = date.add(1, 'month');
  
  // Si le dernier jour du mois est un dimanche (0), on n'ajoute pas de jours du mois suivant
  if (lastDayOfMonth !== 0) {
    const daysToAdd = 7 - lastDayOfMonth;
    for (let i = 1; i <= daysToAdd; i++) {
      days.push({
        date: nextMonth.date(i),
        isCurrentMonth: false,
      });
    }
  }
  
  return days;
};

// Fonction pour formater la date au format FR
const formatDateFR = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function AgendaPage() {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [calendarDays, setCalendarDays] = useState([]);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [allTasks, setAllTasks] = useState([]);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [duration, setDuration] = useState(1);
  
  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduledRes, tasksRes, zonesRes] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/tasks'),
          fetch('/api/zones'),
        ]);
        
        const [scheduledData, tasksData, zonesData] = await Promise.all([
          scheduledRes.json(),
          tasksRes.json(),
          zonesRes.json(),
        ]);

        const realTasks = tasksData.filter(t => !t.isGroup);
        setScheduledTasks(scheduledData);
        setAllTasks(realTasks);

        // Filtrer les tâches non planifiées
        const unscheduled = realTasks.filter(task => !task.date_début);
        setUnscheduledTasks(unscheduled);
        
        setZones(zonesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Mettre à jour les jours du calendrier lorsque currentDate change
  useEffect(() => {
    const days = getDaysInMonth(currentDate.year(), currentDate.month());
    setCalendarDays(days);
  }, [currentDate]);
  
  // Passer au mois précédent
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };
  
  // Passer au mois suivant
  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };
  
  // Sélectionner un jour
  const handleSelectDay = (day) => {
    setSelectedDay(day);
    
    // Filtrer les tâches pour ce jour
    const tasksForDay = scheduledTasks.filter(task => {
      const taskStartDate = dayjs(task.date_début);
      const taskEndDate = dayjs(task.date_fin);
      return day.isAfter(taskStartDate.subtract(1, 'day')) && day.isBefore(taskEndDate.add(1, 'day'));
    });
    
    setTasksForSelectedDay(tasksForDay);
  };
  
  // Ouvrir le dialogue de planification
  const handleOpenSchedulingDialog = () => {
    setSelectedTask(null);
    setDuration(1);
    setSchedulingDialogOpen(true);
  };
  
  // Fermer le dialogue de planification
  const handleCloseSchedulingDialog = () => {
    setSchedulingDialogOpen(false);
  };
  
  // Planifier une tâche
  const handleScheduleTask = async () => {
    if (!selectedTask || !selectedDay) return;
    
    try {
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: selectedTask.zone,
          titre: selectedTask.titre,
          action: 'schedule',
          startDate: selectedDay.toISOString(),
          duration: parseFloat(duration),
        }),
      });
      
      if (response.ok) {
        // Recharger les tâches planifiées et non planifiées
        const [scheduledRes, tasksRes] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/tasks'),
        ]);
        
        const [scheduledData, tasksData] = await Promise.all([
          scheduledRes.json(),
          tasksRes.json(),
        ]);

        const realTasks = tasksData.filter(t => !t.isGroup);
        setScheduledTasks(scheduledData);
        setAllTasks(realTasks);

        // Mettre à jour les tâches non planifiées
        const unscheduled = realTasks.filter(task => !task.date_début);
        setUnscheduledTasks(unscheduled);
        
        // Mettre à jour les tâches pour le jour sélectionné
        const tasksForDay = scheduledData.filter(task => {
          const taskStartDate = dayjs(task.date_début);
          const taskEndDate = dayjs(task.date_fin);
          return selectedDay.isAfter(taskStartDate.subtract(1, 'day')) && selectedDay.isBefore(taskEndDate.add(1, 'day'));
        });
        
        setTasksForSelectedDay(tasksForDay);
        
        handleCloseSchedulingDialog();
      }
    } catch (error) {
      console.error('Erreur lors de la planification de la tâche:', error);
    }
  };
  
  // Annuler la planification d'une tâche
  const handleUnscheduleTask = async (zone, titre) => {
    console.log("Déplanification de la tâche:", zone, titre);
    try {
      // Utiliser le nouvel endpoint API
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: zone,
          titre: titre,
          action: 'unschedule',
        }),
      });
      
      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      console.log("Type de contenu de la réponse:", contentType);
      
      if (contentType && contentType.includes('application/json')) {
        if (response.ok) {
          const jsonResponse = await response.json();
          console.log("Réponse de déplanification:", jsonResponse);
          console.log("Déplanification réussie!");
          
          // Recharger les tâches planifiées et non planifiées
          const [scheduledRes, tasksRes] = await Promise.all([
            fetch('/api/schedule'),
            fetch('/api/tasks'),
          ]);
          
          if (scheduledRes.ok && tasksRes.ok) {
            const scheduledData = await scheduledRes.json();
            const tasksData = await tasksRes.json();

            const realTasks = tasksData.filter(t => !t.isGroup);
            setScheduledTasks(scheduledData);
            setAllTasks(realTasks);

            // Mettre à jour les tâches non planifiées
            const unscheduled = realTasks.filter(task => !task.date_début);
            setUnscheduledTasks(unscheduled);
            
            // Mettre à jour les tâches pour le jour sélectionné
            if (selectedDay) {
              const tasksForDay = scheduledData.filter(task => {
                const taskStartDate = dayjs(task.date_début);
                const taskEndDate = dayjs(task.date_fin);
                return selectedDay.isAfter(taskStartDate.subtract(1, 'day')) && selectedDay.isBefore(taskEndDate.add(1, 'day'));
              });
              
              setTasksForSelectedDay(tasksForDay);
            }
          } else {
            console.error("Erreur lors du rechargement des données:", 
              scheduledRes.status, tasksRes.status);
            alert("Erreur lors du rechargement des données après déplanification");
          }
        } else {
          const errorData = await response.json();
          console.error("Erreur de déplanification:", errorData);
          alert(`Erreur lors de la déplanification: ${JSON.stringify(errorData)}`);
        }
      } else {
        // Si le contenu n'est pas du JSON, afficher le texte de la réponse
        const textResponse = await response.text();
        console.error("Réponse non-JSON reçue:", textResponse.substring(0, 150) + "...");
        alert("Erreur: La réponse du serveur n'est pas au format JSON. Vérifiez la console pour plus de détails.");
      }
    } catch (error) {
      console.error('Erreur lors de la déplanification de la tâche:', error);
      alert(`Erreur lors de la déplanification: ${error.message}`);
    }
  };
  
  // Mettre à jour le statut d'une tâche
  const handleStatusChange = async (zone, titre, newStatus) => {
    try {
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: zone,
          titre: titre,
          action: 'updateStatus',
          status: newStatus,
        }),
      });
      
      if (response.ok) {
        // Mettre à jour l'état local
        setScheduledTasks(
          scheduledTasks.map((task) => {
            if (task.zone === zone && task.titre === titre) {
              return { ...task, statut: newStatus };
            }
            return task;
          })
        );
        
        setTasksForSelectedDay(
          tasksForSelectedDay.map((task) => {
            if (task.zone === zone && task.titre === titre) {
              return { ...task, statut: newStatus };
            }
            return task;
          })
        );
      } else {
        console.error('Erreur lors de la mise à jour du statut:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };
  
  // Obtenir la couleur de statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'À faire':
        return theme.palette.error.main;
      case 'En cours':
        return theme.palette.warning.main;
      case 'En attente':
        return theme.palette.info.main;
      case 'Terminé':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Vérifier si un jour a des tâches planifiées
  const hasTasks = (day) => {
    return scheduledTasks.some(task => {
      const taskStartDate = dayjs(task.date_début);
      const taskEndDate = dayjs(task.date_fin);
      return day.isAfter(taskStartDate.subtract(1, 'day')) && day.isBefore(taskEndDate.add(1, 'day'));
    });
  };
  
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agenda des travaux
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Planifiez et visualisez les tâches dans le temps
        </Typography>
      </Box>
      
      {/* En-tête du calendrier */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth}>
            <NavigateBefore />
          </IconButton>
          <Typography variant="h6">
            {currentDate.format('MMMM YYYY')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <NavigateNext />
          </IconButton>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenSchedulingDialog}
          disabled={!selectedDay}
        >
          Planifier une tâche
        </Button>
      </Box>
      
      {/* Calendrier */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              boxShadow: 1, 
              mb: 3,
              backgroundColor: 'background.paper',
            }}
          >
            {/* Jours de la semaine */}
            <Grid container sx={{ mb: 1 }}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                <Grid 
                  item 
                  key={index} 
                  xs={1.7} 
                  sx={{ 
                    textAlign: 'center',
                    p: 1,
                    fontWeight: 'bold',
                    color: index >= 5 ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {day}
                </Grid>
              ))}
            </Grid>
            
            {/* Jours du mois */}
            <Grid container>
              {calendarDays.map((day, index) => (
                <Grid 
                  item 
                  key={index} 
                  xs={1.7} 
                  sx={{ 
                    textAlign: 'center',
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      p: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      backgroundColor: selectedDay && day.date.isSame(selectedDay, 'day') 
                        ? 'primary.main'
                        : day.isCurrentMonth
                          ? hasTasks(day.date) ? 'primary.lighter' : 'transparent'
                          : 'grey.100',
                      color: selectedDay && day.date.isSame(selectedDay, 'day') 
                        ? 'white'
                        : day.isCurrentMonth
                          ? 'text.primary'
                          : 'text.secondary',
                      '&:hover': {
                        backgroundColor: selectedDay && day.date.isSame(selectedDay, 'day') 
                          ? 'primary.dark'
                          : 'primary.lighter',
                      },
                      ...(day.date.isSame(dayjs(), 'day') && {
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }),
                    }}
                    onClick={() => handleSelectDay(day.date)}
                  >
                    {day.date.format('D')}
                    
                    {hasTasks(day.date) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: selectedDay && day.date.isSame(selectedDay, 'day')
                            ? 'white'
                            : 'primary.main',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          {/* Liste des tâches planifiées */}
          <Typography variant="h6" gutterBottom>
            {selectedDay ? `Tâches pour le ${selectedDay.format('D MMMM YYYY')}` : 'Tâches planifiées'}
          </Typography>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              boxShadow: 1,
              backgroundColor: 'background.paper',
              minHeight: 300,
            }}
          >
            {selectedDay ? (
              tasksForSelectedDay.length > 0 ? (
                tasksForSelectedDay.map((task) => (
                  <TaskCard
                    key={`${task.zone}-${task.titre}`}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onUnschedule={handleUnscheduleTask}
                    onDelete={(zone, titre) => {
                      // Rediriger vers la page des travaux pour la suppression
                      alert("Pour supprimer une tâche, veuillez utiliser la page 'Liste des travaux'");
                    }}
                    onEdit={(zone, titre, updatedTask) => {
                      // Rediriger vers la page des travaux pour l'édition
                      alert("Pour modifier une tâche, veuillez utiliser la page 'Liste des travaux'");
                    }}
                  />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                  <EventIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">
                    Aucune tâche planifiée pour cette date.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenSchedulingDialog}
                    sx={{ mt: 2 }}
                  >
                    Planifier une tâche
                  </Button>
                </Box>
              )
            ) : (
              <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                <Typography variant="body1">
                  Sélectionnez une date pour voir les tâches planifiées.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Vue d'ensemble des tâches planifiées */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              boxShadow: 1,
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Prochaines tâches
            </Typography>
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tâche</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledTasks
                    .filter(task => dayjs(task.date_début).isAfter(dayjs().subtract(1, 'day')))
                    .sort((a, b) => dayjs(a.date_début).diff(dayjs(b.date_début)))
                    .slice(0, 10)
                    .map((task) => (
                      <TableRow 
                        key={`${task.zone}-${task.titre}`}
                        sx={{ '&:hover': { backgroundColor: 'background.default' } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {task.titre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.zone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateFR(task.date_début)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={task.statut} 
                            size="small"
                            sx={{ 
                              backgroundColor: getStatusColor(task.statut),
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {scheduledTasks.filter(task => dayjs(task.date_début).isAfter(dayjs().subtract(1, 'day'))).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Aucune tâche planifiée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Paper 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              boxShadow: 1,
              backgroundColor: 'background.paper',
              mt: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tâches non planifiées
            </Typography>
            <TableContainer sx={{ maxHeight: 300, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tâche</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unscheduledTasks.map((task) => (
                    <TableRow 
                      key={`${task.zone}-${task.titre}`}
                      sx={{ '&:hover': { backgroundColor: 'background.default' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.titre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.zone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          disabled={!selectedDay}
                          onClick={() => {
                            setSelectedTask(task);
                            setDuration(task.durée_estimée || 1);
                            setSchedulingDialogOpen(true);
                          }}
                        >
                          Planifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {unscheduledTasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Toutes les tâches sont planifiées
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogue de planification */}
      <Dialog open={schedulingDialogOpen} onClose={handleCloseSchedulingDialog} fullWidth maxWidth="sm">
        <DialogTitle>Planifier une tâche</DialogTitle>
        <DialogContent>
          {selectedDay && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Date sélectionnée: {selectedDay.format('D MMMM YYYY')}
              </Typography>
              
              <FormControl fullWidth margin="dense" sx={{ mb: 2, mt: 2 }}>
                <InputLabel>Tâche à planifier</InputLabel>
                <Select
                  value={selectedTask ? `${selectedTask.zone}|${selectedTask.titre}` : ''}
                  label="Tâche à planifier"
                  onChange={(e) => {
                    const [zone, titre] = e.target.value.split('|');
                    const task = unscheduledTasks.find(t => t.zone === zone && t.titre === titre);
                    if (task) {
                      setSelectedTask(task);
                      setDuration(task.durée_estimée || 1);
                    }
                  }}
                >
                  {unscheduledTasks.map((task) => (
                    <MenuItem key={`${task.zone}|${task.titre}`} value={`${task.zone}|${task.titre}`}>
                      {task.titre} ({task.zone})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedTask && (
                <>
                  <TextField
                    margin="dense"
                    label="Durée (jours)"
                    fullWidth
                    type="number"
                    inputProps={{ min: 0.1, step: 0.1 }}
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date de début: {selectedDay.format('D MMMM YYYY')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date de fin: {selectedDay.add(duration, 'day').format('D MMMM YYYY')}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSchedulingDialog}>Annuler</Button>
          <Button 
            onClick={handleScheduleTask} 
            variant="contained" 
            color="primary"
            disabled={!selectedTask || !selectedDay}
          >
            Planifier
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
} 

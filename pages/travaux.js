import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import { motion, Reorder } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function TravauxPage() {
  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    titre: '',
    statut: 'À faire',
    priorité: 'Moyenne',
    durée_estimée: 1,
    parent: '',
  });
  const [selectedZone, setSelectedZone] = useState('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [taskToSchedule, setTaskToSchedule] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [duration, setDuration] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /* ------------------- Chargement initial ------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, zonesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/zones'),
        ]);
        const [tasksData, zonesData] = await Promise.all([
          tasksRes.json(),
          zonesRes.json(),
        ]);
        setTasks(tasksData);
        setFilteredTasks(tasksData.filter(t => !t.isGroup));
        setZones(zonesData);
        if (zonesData.length) setSelectedZone(zonesData[0]);
      } catch (err) {
        console.error('Erreur lors du chargement des données :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ------------------- Aides & filtres ------------------- */
  const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];

  const applyFilter = (list, statusIndex) => {
    if (statusIndex === 0) return list.filter(t => !t.isGroup);
    return list.filter(t => t.statut === statuses[statusIndex - 1]);
  };

  const refreshTasks = async () => {
    const data = await (await fetch('/api/tasks')).json();
    setTasks(data);
    setFilteredTasks(applyFilter(data, tabValue));
  };

  const postUpdate = async payload => {
    await fetch('/api/tasks-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await refreshTasks();
  };

  /* ------------------- Handlers ------------------- */
  const handleTabChange = (_, v) => {
    setTabValue(v);
    setFilteredTasks(applyFilter(tasks, v));
  };

  const handleAddTask = async () => {
    if (!newTask.titre || !selectedZone) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone: selectedZone, task: newTask }),
    });
    handleAddDialogClose();
    await refreshTasks();
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewTask({ titre: '', statut: 'À faire', priorité: 'Moyenne', durée_estimée: 1, parent: '' });
  };

  const handleStatusChange   = (z, t, s)          => postUpdate({ zone: z, titre: t, action: 'updateStatus', status: s });
  const handleEdit           = (z, t, u)          => postUpdate({ zone: z, titre: t, action: 'update',        ...u });
  const handleDelete         = (z, t)             => postUpdate({ zone: z, titre: t, action: 'delete' });
  const handleUnscheduleTask = (z, t)             => postUpdate({ zone: z, titre: t, action: 'unschedule' });

  const handleScheduleTask   = async () => {
    if (!taskToSchedule) return;
    await postUpdate({
      zone: taskToSchedule.zone,
      titre: taskToSchedule.titre,
      action: 'schedule',
      startDate: startDate.toISOString(),
      duration: parseFloat(duration),
    });
    setScheduleDialogOpen(false);
  };

  const handleToggleGroup = key =>
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const handleReorder = async newOrder => {
    const orderPayload = newOrder.map(t => ({ zone: t.zone, titre: t.titre }));
    const grouped = filteredTasks.filter(t => t.parent);
    setFilteredTasks([...grouped, ...newOrder]);
    await fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderPayload }),
    });
    await refreshTasks();
  };

  /* ------------------- Rendu ------------------- */
  return (
    <Layout>
      {/* ----------- En-tête ----------- */}
      <Box mb={4}>
        <Typography variant='h4' gutterBottom>Liste des travaux</Typography>
        <Typography variant='subtitle1' color='text.secondary'>Consultez et gérez toutes vos tâches de rénovation</Typography>
      </Box>

      {/* ----------- Filtres + bouton d’ajout ----------- */}
      <Box
        mb={3}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        gap={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ backgroundColor: 'background.paper', borderRadius: 1, boxShadow: 1, minHeight: 48 }}
        >
          <Tab label='Tous' />
          {statuses.map(s => <Tab key={s} label={s} />)}
        </Tabs>

        <Button variant='contained' startIcon={<AddIcon />} sx={{ minWidth: 200 }} onClick={() => setAddDialogOpen(true)}>
          Ajouter une tâche
        </Button>
      </Box>

      {/* ----------- Liste des tâches ----------- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .5 }}>
        <Grid container spacing={isMobile ? 1 : 2}>
          {filteredTasks.length ? (
            <>
              {/* Groupes */}
              {tasks.filter(t => t.isGroup).map(group => {
                const sub = filteredTasks.filter(t => t.parent === group.titre && t.zone === group.zone);
                if (!sub.length) return null;
                const key = `${group.zone}-${group.titre}`;
                return (
                  <Grid item xs={12} key={`group-${key}`}>
                    <Paper
                      sx={{ p:2, mb:1, display:'flex', alignItems:'center', backgroundColor:'grey.100' }}
                      onClick={() => handleToggleGroup(key)}
                    >
                      <IconButton size='small'>
                        {expandedGroups[key] ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                      </IconButton>
                      <Typography variant='subtitle1' sx={{ fontWeight:'bold', ml:1 }}>{group.titre}</Typography>
                    </Paper>
                    <Collapse in={!!expandedGroups[key]} unmountOnExit timeout='auto'>
                      <Grid container spacing={isMobile ? 1 : 2} pl={2}>
                        {sub.map(task => (
                          <Grid item xs={12} key={`${task.zone}-${task.titre}`}>
                            <TaskCard
                              task={task}
                              onStatusChange={handleStatusChange}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onSchedule={() => { setTaskToSchedule(task); setDuration(task.durée_estimée || 1); setStartDate(dayjs()); setScheduleDialogOpen(true); }}
                              onUnschedule={handleUnscheduleTask}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  </Grid>
                );
              })}

              {/* Tâches non groupées (avec ré-ordonnancement) */}
              <Reorder.Group
                axis='y'
                values={filteredTasks.filter(t => !t.parent)}
                onReorder={handleReorder}
                style={{ width: '100%' }}
              >
                {filteredTasks.filter(t => !t.parent).map(task => (
                  <Reorder.Item key={`${task.zone}-${task.titre}`} value={task} style={{ listStyle:'none' }}>
                    <Grid item xs={12}>
                      <TaskCard
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSchedule={() => { setTaskToSchedule(task); setDuration(task.durée_estimée || 1); setStartDate(dayjs()); setScheduleDialogOpen(true); }}
                        onUnschedule={handleUnscheduleTask}
                      />
                    </Grid>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </>
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p:3, textAlign:'center' }}>
                <Typography>Aucune tâche trouvée avec les filtres actuels.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </motion.div>

      {/* ----------- Dialogue d’ajout ----------- */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose} fullWidth maxWidth='sm'>
        <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth margin='dense' label='Titre'
            value={newTask.titre}
            onChange={e => setNewTask({ ...newTask, titre: e.target.value })}
          />
          <FormControl fullWidth margin='dense'>
            <InputLabel>Zone</InputLabel>
            <Select value={selectedZone} label='Zone' onChange={e => setSelectedZone(e.target.value)}>
              {zones.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            fullWidth margin='dense' label='Groupe (optionnel)'
            value={newTask.parent}
            onChange={e => setNewTask({ ...newTask, parent: e.target.value })}
          />
          <FormControl fullWidth margin='dense'>
            <InputLabel>Priorité</InputLabel>
            <Select value={newTask.priorité} label='Priorité' onChange={e => setNewTask({ ...newTask, priorité: e.target.value })}>
              {['Élevée','Moyenne','Basse','Faible'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            fullWidth margin='dense' label='Durée estimée (jours)' type='number' inputProps={{ min:0.1, step:0.1 }}
            value={newTask.durée_estimée}
            onChange={e => setNewTask({ ...newTask, durée_estimée: parseFloat(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Annuler</Button>
          <Button variant='contained' onClick={handleAddTask}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* ----------- Dialogue de planification ----------- */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Planifier la tâche</DialogTitle>
        <DialogContent>
          {taskToSchedule && (
            <Box mt={2}>
              <Typography variant='subtitle1' gutterBottom>{taskToSchedule.titre}</Typography>
              <Divider sx={{ mb:3 }} />
              <DatePicker
                label='Date de début' value={startDate}
                onChange={v => setStartDate(v)} sx={{ width:'100%', mb:3 }}
              />
              <TextField
                fullWidth margin='dense' label='Durée (jours)' type='number' inputProps={{ min:0.1, step:0.1 }}
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Annuler</Button>
          <Button variant='contained' onClick={handleScheduleTask}>Planifier</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

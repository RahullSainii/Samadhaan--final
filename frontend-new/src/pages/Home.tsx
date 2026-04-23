import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Cpu,
  Layers3,
  Navigation,
  Globe2,
  Github,
} from 'lucide-react';

type MapLocation = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lon: number;
};

const LOCATIONS: MapLocation[] = [
  {
    id: 'main',
    label: 'Main Campus',
    address: 'Thapar University, Patiala',
    lat: 30.3549,
    lon: 76.3624,
  },
  {
    id: 'hostel',
    label: 'Hostel Zone',
    address: 'Student Residences, Patiala',
    lat: 30.3525,
    lon: 76.3668,
  },
  {
    id: 'admin',
    label: 'Admin Block',
    address: 'Admin & Records Office',
    lat: 30.3559,
    lon: 76.3603,
  },
];

const toEmbedUrl = (lat: number, lon: number) => {
  const delta = 0.01;
  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
};

const toMapLink = (lat: number, lon: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

const heroImage = '/campus.jpeg';
const profileImage = '/rahul.jpg';

const Home: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].id);
  const [clock, setClock] = useState('');

  const location = useMemo(
    () => LOCATIONS.find((item) => item.id === selectedLocation) || LOCATIONS[0],
    [selectedLocation]
  );

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ pb: 10 }}>
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          overflow: 'hidden',
          color: 'white',
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(120deg, rgba(8, 12, 24, 0.92), rgba(8, 12, 24, 0.68))',
            zIndex: 0,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Chip
                label="Thapar University • Digital Command Center"
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                fontWeight={800}
                sx={{ fontFamily: '"Space Grotesk", sans-serif', color: 'white' }}
              >
                Samadhaan
                <Box component="span" sx={{ color: 'primary.light' }}>
                  .
                </Box>
              </Typography>
              <Typography variant="h5" sx={{ mt: 2, color: 'rgba(255,255,255,0.8)' }}>
                A cinematic complaint management hub inspired by campus innovation. Track, resolve, and collaborate in one immersive space.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                >
                  Launch Dashboard
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}
                >
                  Login
                </Button>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 4, flexWrap: 'wrap' }}>
                {['Real-time resolution', 'Smart analytics', 'Secure workflow'].map((label) => (
                  <Chip
                    key={label}
                    icon={<CheckCircle2 size={16} />}
                    label={label}
                    sx={{
                      bgcolor: 'rgba(14, 165, 233, 0.2)',
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>

              <Paper
                sx={{
                  mt: 4,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Avatar
                  src={profileImage}
                  alt="Rahul Saini"
                  sx={{
                    width: 84,
                    height: 84,
                    border: '2px solid rgba(14, 165, 233, 0.6)',
                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)',
                    '& img': {
                      objectFit: 'cover',
                      objectPosition: 'center 20%',
                    },
                  }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="white">
                    Rahul Saini
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    3rd Year • Computer Engineering
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="Student Profile"
                      size="small"
                      sx={{ bgcolor: 'rgba(14,165,233,0.2)', color: 'white' }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      component="a"
                      href="https://github.com/rahullsainii"
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<Github size={16} />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.35)',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.7)' },
                      }}
                    >
                      @rahullsainii
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  background: 'linear-gradient(145deg, #1f2937, #0b1020)',
                  borderRadius: 4,
                  p: { xs: 2, md: 3 },
                  boxShadow: '0 40px 80px rgba(15, 23, 42, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'floatUp 6s ease-in-out infinite',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', mb: 1 }}>
                  <Typography variant="caption">Samadhaan — Campus Control</Typography>
                  <Typography variant="caption">{clock}</Typography>
                </Box>

                <Box
                  sx={{
                    background: '#0b0f1a',
                    borderRadius: 3,
                    p: 2,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          height: '100%',
                          background:
                            'radial-gradient(circle at top, rgba(56, 189, 248, 0.25), transparent 60%), linear-gradient(180deg, #0f172a, #111827)',
                          color: 'white',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          animation: 'glowPulse 6s ease-in-out infinite',
                        }}
                      >
                        <Typography variant="overline" sx={{ letterSpacing: 2 }}>
                          THAPAR UNIVERSITY
                        </Typography>
                        <Box
                          component="img"
                          src={heroImage}
                          alt="Thapar University"
                          sx={{ mt: 1, borderRadius: 2, height: 120, objectFit: 'cover', width: '100%' }}
                        />
                        <Typography variant="h5" sx={{ mt: 2, fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif' }}>
                          SAMADHAAN
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Innovating solutions for a brighter future.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          height: '100%',
                          background: 'linear-gradient(180deg, #141a2b, #0f172a)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          {['Dashboard', 'Insights', 'Reports', 'Maps'].map((item) => (
                            <Chip
                              key={item}
                              label={item}
                              size="small"
                              sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }}
                            />
                          ))}
                        </Stack>

                        <Grid container spacing={2}>
                          {[
                            { icon: <Sparkles size={18} />, label: 'Smart Routing' },
                            { icon: <Cpu size={18} />, label: 'Auto Assignment' },
                            { icon: <Layers3 size={18} />, label: 'Live Status' },
                            { icon: <ShieldCheck size={18} />, label: 'Secure Access' },
                          ].map((card) => (
                            <Grid size={{ xs: 6 }} key={card.label}>
                              <Box
                                sx={{
                                  borderRadius: 2,
                                  p: 1.5,
                                  bgcolor: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Box sx={{ color: 'primary.light' }}>{card.icon}</Box>
                                <Typography variant="body2">{card.label}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(14,165,233,0.12)' }}>
                          <Typography variant="body2" sx={{ color: 'primary.light' }}>
                            Today&apos;s pulse: 42 open cases • 18 resolved • 6 high-priority
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {[
            {
              title: 'Unified Complaint Hub',
              description: 'Capture every issue with structured workflows and immediate tracking.',
              icon: <Layers3 size={26} />,
            },
            {
              title: 'Actionable Insights',
              description: 'Admin dashboards highlight trends, response times, and bottlenecks.',
              icon: <Sparkles size={26} />,
            },
            {
              title: 'Secure & Transparent',
              description: 'Role-based access with audit-ready histories for every report.',
              icon: <ShieldCheck size={26} />,
            },
          ].map((feature) => (
            <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
              <Card sx={{ height: '100%', p: 2.5, bgcolor: 'background.paper' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" fontWeight={700}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Campus Map Navigator
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Pinpoint complaint locations or locate campus hotspots instantly. Switch between campus zones to view the live map.
              </Typography>
              <ToggleButtonGroup
                value={selectedLocation}
                exclusive
                onChange={(_, value) => value && setSelectedLocation(value)}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {LOCATIONS.map((item) => (
                  <ToggleButton key={item.id} value={item.id} sx={{ textTransform: 'none' }}>
                    {item.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {location.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {location.address}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Navigation size={16} />}
                    component="a"
                    href={toMapLink(location.lat, location.lon)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Live Map
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapPin size={16} />}
                  >
                    Save Location
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                }}
              >
                <iframe
                  title="Campus Map"
                  src={toEmbedUrl(location.lat, location.lon)}
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                />
              </Box>
              <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
                {[
                  { icon: <Globe2 size={16} />, label: 'Live geo-tagging' },
                  { icon: <Navigation size={16} />, label: 'Instant directions' },
                  { icon: <MapPin size={16} />, label: 'Tagged to complaint' },
                ].map((item) => (
                  <Chip
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    sx={{ bgcolor: 'rgba(15, 23, 42, 0.06)', fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h4" fontWeight={700}>
            One platform. Every department.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            From infrastructure to student services, Samadhaan keeps the campus aligned.
          </Typography>
          <Divider sx={{ my: 3, maxWidth: 420, mx: 'auto' }} />
          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
            {['Infrastructure', 'Billing', 'Service', 'Technical'].map((team) => (
              <Chip
                key={team}
                label={team}
                sx={{ bgcolor: 'rgba(14, 165, 233, 0.12)', fontWeight: 700 }}
              />
            ))}
          </Stack>
        </Box>
      </Container>

      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight={700}>
                Samadhaan
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
                A modern complaint management system designed for Thapar University and beyond.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                &copy; {new Date().getFullYear()} Samadhaan. All rights reserved.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
                Thapar University, Patiala
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

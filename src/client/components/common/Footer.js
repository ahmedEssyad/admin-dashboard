import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Grid, 
  IconButton, 
  Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Facebook as FacebookIcon, 
  Twitter as TwitterIcon, 
  Instagram as InstagramIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const socialLinks = [
    { 
      icon: <FacebookIcon />, 
      link: "https://facebook.com", 
      color: "#1877F2" 
    },
    { 
      icon: <TwitterIcon />, 
      link: "https://twitter.com", 
      color: "#1DA1F2" 
    },
    { 
      icon: <InstagramIcon />, 
      link: "https://instagram.com", 
      color: "#E1306C" 
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={4}
          sx={{ 
            position: 'relative', 
            zIndex: 2 
          }}
        >
          <Grid item xs={12} sm={4}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h5" 
                color="text.primary" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1,
                  width: 'fit-content'
                }}
              >
                À propos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Votre plateforme e-commerce de confiance pour tous vos besoins. 
                Nous nous engageons à vous offrir la meilleure expérience d'achat.
              </Typography>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={4}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography 
                variant="h5" 
                color="text.primary" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1,
                  width: 'fit-content'
                }}
              >
                Liens rapides
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Catégories', path: '/categories' },
                  { label: 'Entreprises', path: '/companies' },
                  { label: 'Recherche', path: '/search' },
                  { label: 'Mon Compte', path: '/profile' }
                ].map((item) => (
                  <Link
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateX(5px)',
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Typography 
                variant="h5" 
                color="text.primary" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1,
                  width: 'fit-content'
                }}
              >
                Contact
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  contact@example.com
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Téléphone: +123 456 789
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        {/* Social Media Icons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4,
            gap: 2 
          }}
        >
          {socialLinks.map((social, index) => (
            <Tooltip key={social.link} title={`Suivez-nous sur ${social.link.split('//')[1]}`}>
              <IconButton
                component="a"
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: social.color,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: `${social.color}15`
                  }
                }}
              >
                {social.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        <Box mt={4}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 2
            }}
          >
            {'© '}
            {new Date().getFullYear()}
            {' Mon E-commerce. Tous droits réservés.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
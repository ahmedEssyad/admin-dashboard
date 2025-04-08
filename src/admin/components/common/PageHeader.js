import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Paper, 
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

/**
 * Composant d'en-tête de page réutilisable
 * @param {Object} props - Propriétés du composant 
 * @param {string} props.title - Titre de la page
 * @param {string} [props.subtitle] - Sous-titre optionnel
 * @param {Array} [props.breadcrumbs] - Fil d'Ariane (Breadcrumbs)
 * @param {Object} [props.action] - Configuration du bouton d'action principal
 * @param {React.ReactNode} [props.children] - Contenu supplémentaire (ex: filtres)
 * @returns {JSX.Element} Composant d'en-tête de page
 */
const PageHeader = ({ title, subtitle, breadcrumbs, action, children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Fil d'Ariane */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" fontWeight={500}>
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                component={RouterLink}
                to={item.path}
                underline="hover"
                color="inherit"
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* En-tête avec titre et bouton d'action */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: subtitle ? 1 : (children ? 2 : 0),
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold"
            sx={{ 
              color: theme.palette.text.primary,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ mt: 0.5, mb: children ? 2 : 0 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && (
          <Button
            variant={action.variant || "contained"}
            color={action.color || "primary"}
            startIcon={action.icon || null}
            onClick={action.onClick}
            size={action.size || "medium"}
            sx={{ 
              mt: isMobile ? 2 : 0,
              ...action.sx
            }}
            disabled={action.disabled || false}
          >
            {action.label}
          </Button>
        )}
      </Box>

      {/* Contenu supplémentaire (ex: filtres) */}
      {children}
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ),
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.node,
    size: PropTypes.string,
    sx: PropTypes.object,
    disabled: PropTypes.bool
  }),
  children: PropTypes.node
};

export default PageHeader;
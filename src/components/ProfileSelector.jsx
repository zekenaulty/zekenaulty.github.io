import { Tabs, Tab } from '@mui/material';

function ProfileSelector({ profiles, value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={(event, newValue) => onChange?.(newValue)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      {profiles.map((profile) => (
        <Tab key={profile.id} label={profile.label} value={profile.id} />
      ))}
    </Tabs>
  );
}

export default ProfileSelector;

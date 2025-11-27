import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTeam } from '../hooks/useTeam';
import { useApplicant } from '../hooks/useApplicant';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function MapView() {
  const { data: teamData, isLoading: teamLoading, error: teamError } = useTeam();
  const { data: applicantData, isLoading: applicantLoading } = useApplicant();

  if (teamLoading || applicantLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-posthog-yellow border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading PostHog team data...</p>
        </div>
      </div>
    );
  }

  if (teamError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Failed to load team data</p>
          <p className="text-gray-600 mt-2">Error: {teamError.message}</p>
        </div>
      </div>
    );
  }

  const teamMembers = teamData?.team || [];
  const applicantLocations = applicantData?.locations || [];

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Team Member Markers */}
      {teamMembers.map((member) => (
        <Marker
          key={member.id}
          position={[member.latitude, member.longitude]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
              <p className="text-xs text-gray-500 mt-1">{member.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Applicant Markers (Lisbon & Brasília) */}
      {applicantLocations.map((location, idx) => (
        <Marker
          key={`applicant-${idx}`}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg text-posthog-purple">
                {applicantData.name} {location.flag}
              </h3>
              <p className="text-sm text-gray-600">{applicantData.role}</p>
              <p className="text-xs text-gray-500 mt-1">
                {location.city}, {location.country} ({location.percentage}% of time)
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

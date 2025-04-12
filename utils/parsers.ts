interface SpotifyThumbnail {
    url?: string;
}

interface SpotifyArtist {
    id: string;
    uri: string;
    name: string;
    images: SpotifyThumbnail[];
}

export const parseArtistData = ({
    id,
    uri,
    name,
    images: [
        { url: large = '' } = {},
        { url: medium = '' } = {},
        { url: small = '' } = {}
    ] = []
}: SpotifyArtist): Artist => ({
    id,
    uri,
    name,
    images: { small, medium, large }
});

export interface SpotifyTrack {
    id: string;
    uri: string;
    name: string;
    artists: SpotifyArtist[];
    number: number;
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    preview_url: string | null;
}

export const parseTrackData = ({
    id,
    uri,
    name,
    artists,
    number: trackNumber,
    disc_number: discNumber,
    duration_ms: duration,
    explicit: isExplicit,
    preview_url
}: SpotifyTrack): Track => ({
    id,
    uri,
    name,
    artists: artists.map(parseArtistData),
    trackNumber,
    discNumber,
    duration,
    isExplicit,
    isAvailable: true /** TODO: trouver la bonne façon de set cette clé */,
    isSaved: false
});

export interface SpotifyPlaylistTrack {
    track: {
        album: {
            id: string;
            images: SpotifyThumbnail[];
            name: string;
            release_date: string;
        };
        artists: SpotifyArtist[];
        duration_ms: number;
        id: string;
        uri: string;
        name: string;
        type: string;
        preview_url: string | null;
    };
}

export const parsePlaylistTrackData = ({
    track: {
        album: {
            id: albumId,
            images: [
                { url: large = '' } = {},
                { url: medium = '' } = {},
                { url: small = '' } = {}
            ] = [],
            name: albumName,
            release_date: releaseDate
        },
        artists,
        duration_ms: duration,
        id,
        uri,
        name,
        type,
        preview_url
    }
}: SpotifyPlaylistTrack): PlaylistTrack => ({
    id,
    uri,
    name,
    albumId,
    albumName,
    images: { small, medium, large },
    artists: artists.map(parseArtistData),
    releaseDate,
    duration,
    type,
    isAvailable: true /** TODO: trouver la bonne façon de set cette clé */,
    isSaved: false
});

interface SpotifyAlbum {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    images: SpotifyThumbnail[];
    release_date: string;
    total_tracks: number;
    album_type: string;
    uri: string;
}

export const parseAlbumData = ({
    id,
    name,
    artists,
    images: [
        { url: large = '' } = {},
        { url: medium = '' } = {},
        { url: small = '' } = {}
    ] = [],
    release_date: releaseDate,
    total_tracks: itemCount,
    album_type: albumType,
    uri
}: SpotifyAlbum): Album => ({
    id,
    name,
    artists: artists.map(parseArtistData),
    images: { small, medium, large },
    releaseDate,
    itemCount,
    albumType: capitalize(albumType),
    uri,
    isSaved: false
});

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    owner: { id: string; display_name: string };
    href: string;
    collaborative: boolean;
    images?: SpotifyThumbnail[];
    followed: boolean;
    uri: string;
    tracks: { items: SpotifyPlaylistTrack[]; total: number };
}

export const parsePlaylistData = ({
    id,
    name,
    description,
    owner,
    images,
    followed: isFollowed,
    uri,
    tracks: { total: totalItemCount }
}: SpotifyPlaylist): Playlist => {
    const { id: userId = '', display_name: userName = '' } = owner || {};

    const [
        { url: large = '' } = {},
        { url: medium = '' } = {},
        { url: small = '' } = {}
    ] = images || [];

    return {
        id,
        userId,
        userName,
        name,
        description,
        images: { small, medium, large },
        isFollowed,
        uri,
        totalItemCount
    };
};

// export const parseSearchData = ({}) => ({});
interface SpotifyDevice {
    id: string;
    name: string;
    type: string;
    is_active: boolean;
}

export const parseDeviceData = ({
    id,
    name,
    type,
    is_active: isActive
}: SpotifyDevice): Device => ({ id, name, type: type.toLowerCase(), isActive });

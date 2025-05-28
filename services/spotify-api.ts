import axios from 'axios';
import type { SpotifyTrack } from '~/utils/parsers';

const ITEMS_PER_REQUEST = 50;

async function areTracksSaved(trackIds: string[]) {
    const { data } = await axios.get('/me/tracks/contains', {
        params: { ids: trackIds.join(',') }
    });

    return trackIds.reduce(
        (obj: { [key: string]: boolean }, trackId, index) => {
            obj[trackId] = data[index];

            return obj;
        },
        {}
    );
}

export async function isTrackSaved(trackId: string): Promise<boolean> {
    const {
        data: [isSaved]
    } = await axios.get('/me/tracks/contains', {
        params: { ids: trackId }
    });

    return isSaved;
}

export async function isAlbumSaved(trackId: string): Promise<boolean> {
    const {
        data: [isSaved]
    } = await axios.get('/me/albums/contains', {
        params: { ids: trackId }
    });

    return isSaved;
}

/** TODO: implémenter dans getPlaylist + implémenter sauvegarde de playlists tierces ? */
export async function isPlaylistSaved(playlistId: string): Promise<boolean> {
    const {
        data: [isSaved]
    } = await axios.get('/me/playlists/contains', {
        params: { ids: playlistId }
    });

    return isSaved;
}

async function getTracksWithSavedStatus<T extends { id: string }>(tracks: T[]) {
    const trackIds = tracks.map(({ id }) => id);
    const savedById = await areTracksSaved(trackIds);

    return tracks.map((data) => ({
        ...data,
        isSaved: savedById[data.id]
    }));
}

export async function toggleSaveTrack(trackId: string) {
    const isSaved = await isTrackSaved(trackId);

    if (isSaved) {
        await axios.delete('/me/tracks', { params: { ids: trackId } });
    } else {
        await axios.put('/me/tracks', { ids: [trackId] });
    }

    return !isSaved;
}

export async function getTrack(trackId: string) {
    const [{ data: track }, isSaved] = await Promise.all([
        axios.get(`/tracks/${trackId}`),
        isTrackSaved(trackId)
    ]);

    return {
        ...parsePlaylistTrackData({ track }),
        isSaved
    };
}

export async function toggleSaveAlbum(albumId: string) {
    const isSaved = await isAlbumSaved(albumId);

    if (isSaved) {
        await axios.delete('/me/albums', { params: { ids: albumId } });
    } else {
        await axios.put('/me/albums', { ids: [albumId] });
    }

    return !isSaved;
}

export async function getAlbum(albumId: string) {
    const [{ data }, isSaved] = await Promise.all([
        axios.get(`/albums/${albumId}`, {
            params: { market: 'FR' }
        }),
        isAlbumSaved(albumId)
    ]);

    return { ...parseAlbumData(data), isSaved };
}

export async function getAlbumTracks(albumId: string, offset: number = 0) {
    const {
        data: { items }
    } = await axios.get(`/albums/${albumId}/tracks`, {
        params: { market: 'FR', limit: ITEMS_PER_REQUEST, offset }
    });

    if (items.length) {
        const tracks = (items as SpotifyTrack[]).map(parseTrackData);

        return await getTracksWithSavedStatus(tracks);
    }

    return [];
}

export async function getArtist(artistId: string) {
    const { data } = await axios(`/artists/${artistId}`);

    return parseArtistData(data);
}

export async function getArtistAlbums(artistId: string, offset: number = 0) {
    const {
        data: { items, total }
    } = await axios(`/artists/${artistId}/albums`, {
        params: { limit: ITEMS_PER_REQUEST, offset }
    });

    return {
        albums: items.map(parseAlbumData) as Album[],
        albumCount: total as number
    };
}

export async function createPlaylist(userId: string, name: string) {
    const { data } = await axios.post(`/users/${userId}/playlists`, {
        name
    });

    return parsePlaylistData(data);
}

export async function getPlaylist(playlistId: string) {
    const { data } = await axios.get(`/playlists/${playlistId}`);

    return parsePlaylistData(data);
}

export async function updatePlaylist(
    playlistId: string,
    data: { name: string; description: string }
) {
    await axios.put(`/playlists/${playlistId}`, data);
}

export async function updatePlaylistCover(
    playlistId: string,
    encodedFile: string
) {
    await axios.put(`/playlists/${playlistId}/images`, encodedFile);
}

export async function getPlaylistTracks(
    playlistId: string,
    offset: number = 0
) {
    const {
        data: { items }
    } = await axios.get(`/playlists/${playlistId}/tracks`, {
        params: { market: 'FR', limit: ITEMS_PER_REQUEST, offset }
    });

    if (items.length) {
        const tracks = (items as SpotifyPlaylistTrack[]).map(
            parsePlaylistTrackData
        );

        return await getTracksWithSavedStatus(tracks);
    }

    return [];
}

export async function getUser(userId: string) {
    const {
        data: {
            id,
            display_name: name,
            images: [{ url: profilePicture = '' } = {}]
        }
    } = await axios(`/users/${userId}`);

    return {
        id,
        name,
        profilePicture
    } satisfies User;
}

export async function getUserPlaylists(userId?: string, offset: number = 0) {
    const {
        data: { items, total }
    } = await axios.get(`/${userId ? `users/${userId}` : 'me'}/playlists`, {
        params: {
            offset,
            limit: ITEMS_PER_REQUEST
        }
    });

    return {
        items: items.map((data: SpotifyPlaylist) => ({
            ...parsePlaylistData(data),
            ...(!userId && {
                isFollowed: true
            })
        })) as Playlist[],
        totalItemCount: total as number
    } as const;
}

export async function addPlaylistTrack(playlistId: string, trackId: string) {
    await axios.post(`/playlists/${playlistId}/tracks`, {
        uris: [`spotify:track:${trackId}`]
    });
}

export async function removePlaylistTrack(playlistId: string, trackId: string) {
    await axios.delete(`/playlists/${playlistId}/tracks`, {
        data: {
            tracks: [{ uri: `spotify:track:${trackId}` }]
        }
    });
}

export async function getSavedTracks(offset: number) {
    const {
        data: { items }
    } = await axios.get('/me/tracks', {
        params: { limit: ITEMS_PER_REQUEST, offset }
    });

    return items.map(parsePlaylistTrackData);
}

export async function searchAll(query: string) {
    const {
        data: {
            artists: { items: artists },
            albums: { items: albums },
            tracks: { items: tracks },
            playlists: { items: playlists }
        }
    } = await axios.get('/search', {
        params: {
            q: query,
            type: 'album,artist,playlist,track'
        }
    });

    return {
        artists: artists.map(parseArtistData),
        albums: albums.map(parseAlbumData),
        tracks: tracks.map(parseTrackData),
        playlists: playlists.filter(Boolean).map(parsePlaylistData)
    };
}

export async function searchArtists(query: string, offset: number = 0) {
    const {
        data: {
            artists: { items }
        }
    } = await axios.get('/search', {
        params: {
            q: query,
            type: 'artist',
            offset,
            limit: ITEMS_PER_REQUEST
        }
    });

    return items.map(parseArtistData);
}

export async function searchAlbums(query: string, offset: number = 0) {
    const {
        data: {
            albums: { items }
        }
    } = await axios.get('/search', {
        params: {
            q: query,
            type: 'album',
            offset,
            limit: ITEMS_PER_REQUEST
        }
    });

    return items.map(parseAlbumData);
}

export async function searchTracks(query: string, offset: number = 0) {
    const {
        data: {
            tracks: { items }
        }
    } = await axios.get('/search', {
        params: {
            q: query,
            type: 'track',
            offset,
            limit: ITEMS_PER_REQUEST
        }
    });

    return items.map(parseTrackData);
}

export async function searchPlaylists(query: string, offset: number = 0) {
    const {
        data: {
            playlists: { items }
        }
    } = await axios.get('/search', {
        params: {
            q: query,
            type: 'playlist',
            offset,
            limit: ITEMS_PER_REQUEST
        }
    });

    return items.filter(Boolean).map(parsePlaylistData);
}

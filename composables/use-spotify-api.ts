import axios from 'axios';
import type { SpotifyTrack } from '~/utils/parsers';

export const useSpotifyApi = () => {
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

    async function isTrackSaved(trackId: string) {
        const {
            data: [isSaved]
        } = await axios.get('/me/tracks/contains', {
            params: { ids: trackId }
        });

        return isSaved;
    }

    async function isAlbumSaved(trackId: string) {
        const {
            data: [isSaved]
        } = await axios.get('/me/albums/contains', {
            params: { ids: trackId }
        });

        return isSaved;
    }

    async function isPlaylistSaved(playlistId: string) {
        const {
            data: [isSaved]
        } = await axios.get('/me/playlists/contains', {
            params: { ids: playlistId }
        });

        return isSaved;
    }

    async function getTracksWithSavedStatus<T extends { id: string }>(
        tracks: T[]
    ) {
        const trackIds = tracks.map(({ id }) => id);
        const savedById = await areTracksSaved(trackIds);

        return tracks.map((data) => ({
            ...data,
            isSaved: savedById[data.id]
        }));
    }

    return {
        isTrackSaved,
        async toggleSaveTrack(trackId: string) {
            const isSaved = await isTrackSaved(trackId);

            if (isSaved) {
                await axios.delete('/me/tracks', { params: { ids: trackId } });
            } else {
                await axios.put('/me/tracks', { ids: [trackId] });
            }

            return !isSaved;
        },
        async getTrack(trackId: string) {
            const { data: track } = await axios.get(`/tracks/${trackId}`);

            return parsePlaylistTrackData({ track });
        },
        isAlbumSaved,
        async toggleSaveAlbum(albumId: string) {
            const isSaved = await isAlbumSaved(albumId);

            if (isSaved) {
                await axios.delete('/me/albums', { params: { ids: albumId } });
            } else {
                await axios.put('/me/albums', { ids: [albumId] });
            }

            return !isSaved;
        },
        async getAlbum(albumId: string) {
            const { data } = await axios.get(`/albums/${albumId}`, {
                params: { market: 'FR' }
            });

            return parseAlbumData(data);
        },
        async getAlbumTracks(albumId: string, offset: number = 0) {
            const {
                data: { items }
            } = await axios.get(`/albums/${albumId}/tracks`, {
                params: { market: 'FR', limit: 50, offset }
            });

            if (items.length) {
                const tracks = (items as SpotifyTrack[]).map(parseTrackData);

                return await getTracksWithSavedStatus(tracks);
            }

            return [];
        },
        async getArtist(artistId: string) {
            const { data } = await axios(`/artists/${artistId}`);

            return parseArtistData(data);
        },
        async getArtistAlbums(artistId: string, offset: number = 0) {
            const {
                data: { items, total }
            } = await axios(`/artists/${artistId}/albums`, {
                params: { limit: 50, offset }
            });

            return {
                albums: items.map(parseAlbumData) as Album[],
                albumCount: total as number
            };
        },
        isPlaylistSaved,
        async createPlaylist(userId: string, name: string) {
            const { data } = await axios.post(`/users/${userId}/playlists`, {
                name
            });

            return parsePlaylistData(data);
        },
        async getPlaylist(playlistId: string) {
            const { data } = await axios.get(`/playlists/${playlistId}`);

            return parsePlaylistData(data);
        },
        async updatePlaylist(
            playlistId: string,
            data: { name: string; description: string }
        ) {
            await axios.put(`/playlists/${playlistId}`, data);
        },
        async updatePlaylistCover(playlistId: string, encodedFile: string) {
            await axios.put(`/playlists/${playlistId}/images`, encodedFile);
        },
        async getPlaylistTracks(playlistId: string, offset: number = 0) {
            const {
                data: { items }
            } = await axios.get(`/playlists/${playlistId}/tracks`, {
                params: { market: 'FR', limit: 50, offset }
            });

            if (items.length) {
                const tracks = (items as SpotifyPlaylistTrack[]).map(
                    parsePlaylistTrackData
                );

                return await getTracksWithSavedStatus(tracks);
            }

            return [];
        },
        async getUserPlaylists(userId?: string, offset: number = 0) {
            const {
                data: { items, total }
            } = await axios.get(
                `/${userId ? `users/${userId}` : 'me'}/playlists`,
                {
                    params: {
                        offset,
                        limit: 50
                    }
                }
            );

            return {
                items: items.map((data: SpotifyPlaylist) => ({
                    ...parsePlaylistData(data),
                    ...(!userId && {
                        isFollowed: true
                    })
                })) as Playlist[],
                totalItemCount: total as number
            } as const;
        },
        async addPlaylistTrack(playlistId: string, trackId: string) {
            await axios.post(`/playlists/${playlistId}/tracks`, {
                uris: [`spotify:track:${trackId}`]
            });
        },
        async removePlaylistTrack(playlistId: string, trackId: string) {
            await axios.delete(`/playlists/${playlistId}/tracks`, {
                data: {
                    tracks: [{ uri: `spotify:track:${trackId}` }]
                }
            });
        },
        async getSavedTracks(offset: number) {
            const {
                data: { items }
            } = await axios.get('/me/tracks', {
                params: { limit: 50, offset }
            });

            return items.map(parsePlaylistTrackData);
        },
        async searchAll(query: string) {
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
        },
        async searchArtists(query: string, offset: number = 0) {
            const {
                data: {
                    artists: { items }
                }
            } = await axios.get('/search', {
                params: {
                    q: query,
                    type: 'artist',
                    offset,
                    limit: 50
                }
            });

            return items.map(parseArtistData);
        },
        async searchAlbums(query: string, offset: number = 0) {
            const {
                data: {
                    albums: { items }
                }
            } = await axios.get('/search', {
                params: {
                    q: query,
                    type: 'album',
                    offset,
                    limit: 50
                }
            });

            return items.map(parseAlbumData);
        },
        async searchTracks(query: string, offset: number = 0) {
            const {
                data: {
                    tracks: { items }
                }
            } = await axios.get('/search', {
                params: {
                    q: query,
                    type: 'track',
                    offset,
                    limit: 50
                }
            });

            return items.map(parseTrackData);
        },
        async searchPlaylists(query: string, offset: number = 0) {
            const {
                data: {
                    playlists: { items }
                }
            } = await axios.get('/search', {
                params: {
                    q: query,
                    type: 'playlist',
                    offset,
                    limit: 50
                }
            });

            return items.map(parsePlaylistData);
        }
    };
};

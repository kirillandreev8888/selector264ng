export interface ShikimoriApiAnimesResponse {
    animes: Anime[];
}

interface Anime {
    id:                string;
    name:              string;
    russian:           string;
    licenseNameRu:     null;
    kind:              string;
    rating:            string;
    score:             number;
    status:            string;
    episodes:          number;
    episodesAired:     number;
    duration:          number;
    airedOn:           EdOn;
    releasedOn:        EdOn;
    season:            string;
    poster:            Poster;
    genres:            Genre[];
    description:       null;
    descriptionHtml:   string;
    descriptionSource: null;
}

interface EdOn {
    year:  number;
    month: number;
    day:   number;
    date:  Date;
}

interface Genre {
    id:      string;
    name:    string;
    russian: string;
    kind:    string;
}

interface Poster {
    id:          string;
    originalUrl: string;
    mainUrl:     string;
}
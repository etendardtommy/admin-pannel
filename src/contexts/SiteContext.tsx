import React, { createContext, useContext, useState, useEffect } from 'react';

interface Site {
    id: number;
    name: string;
    url?: string;
}

interface SiteContextType {
    activeSite: Site | null;
    setActiveSite: (site: Site | null) => void;
    sites: Site[];
    setSites: (sites: Site[]) => void;
    isLoadingSites: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sites, setSites] = useState<Site[]>([]);
    const [activeSite, setActiveSiteState] = useState<Site | null>(null);
    const [isLoadingSites] = useState(true);

    useEffect(() => {
        // Load active site from localStorage on mount
        const storedSiteId = localStorage.getItem('activeSiteId');
        if (storedSiteId && sites.length > 0) {
            const site = sites.find(s => s.id === parseInt(storedSiteId, 10));
            if (site) {
                setActiveSiteState(site);
            } else if (sites.length > 0) {
                // Fallback to first site if stored one is not found
                setActiveSiteState(sites[0]);
                localStorage.setItem('activeSiteId', sites[0].id.toString());
            }
        } else if (sites.length > 0 && !activeSite) {
            setActiveSiteState(sites[0]);
            localStorage.setItem('activeSiteId', sites[0].id.toString());
        }
    }, [sites]);

    const setActiveSite = (site: Site | null) => {
        setActiveSiteState(site);
        if (site) {
            localStorage.setItem('activeSiteId', site.id.toString());
        } else {
            localStorage.removeItem('activeSiteId');
        }
    };

    return (
        <SiteContext.Provider value={{ activeSite, setActiveSite, sites, setSites, isLoadingSites: sites.length === 0 && isLoadingSites }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => {
    const context = useContext(SiteContext);
    if (context === undefined) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};

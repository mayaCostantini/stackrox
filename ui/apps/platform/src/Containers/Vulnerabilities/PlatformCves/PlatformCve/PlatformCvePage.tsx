import React, { useEffect, useState } from 'react';
import { PageSection, Breadcrumb, Divider, BreadcrumbItem, Skeleton } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';

import PageTitle from 'Components/PageTitle';
import BreadcrumbItemLink from 'Components/BreadcrumbItemLink';

import { DEFAULT_PAGE_SIZE } from 'Components/Table';
import useURLPagination from 'hooks/useURLPagination';
import useURLSearch from 'hooks/useURLSearch';
import { getTableUIState } from 'utils/getTableUIState';
import CvePageHeader, { CveMetadata } from '../../components/CvePageHeader';
import {
    getOverviewPagePath,
    getRegexScopedQueryString,
    parseWorkloadQuerySearchFilter,
} from '../../utils/searchUtils';
import useAffectedClusters from './useAffectedClusters';
import AffectedClustersTable from './AffectedClustersTable';

const workloadCveOverviewCvePath = getOverviewPagePath('Platform', {
    entityTab: 'CVE',
});

function PlatformCvePage() {
    const { searchFilter } = useURLSearch();
    const querySearchFilter = parseWorkloadQuerySearchFilter(searchFilter);

    // We need to scope all queries to the *exact* CVE name so that we don't accidentally get
    // data that matches a prefix of the CVE name in the nested fields
    const { cveId } = useParams() as { cveId: string };
    const exactCveIdSearchRegex = `^${cveId}$`;
    const query = getRegexScopedQueryString({
        ...querySearchFilter,
        CVE: [exactCveIdSearchRegex],
    });

    const { page, perPage } = useURLPagination(DEFAULT_PAGE_SIZE);

    const { affectedClustersRequest, clusterData } = useAffectedClusters(query, page, perPage);

    const [platformCveMetadata, setPlatformCveMetadata] = useState<CveMetadata>();
    const cveName = platformCveMetadata?.cve;

    // TODO - Simulate a loading state, will replace metadata with results from a query
    useEffect(() => {
        setTimeout(() => {
            setPlatformCveMetadata({
                cve: cveId,
                firstDiscoveredInSystem: '2021-01-01T00:00:00Z',
                distroTuples: [
                    {
                        summary: 'This is a sample description used during development',
                        link: `https://access.redhat.com/security/cve/${cveId}`,
                        operatingSystem: 'rhel',
                    },
                ],
            });
        }, 1500);
    }, [cveId]);

    const tableState = getTableUIState({
        isLoading: affectedClustersRequest.loading,
        error: affectedClustersRequest.error,
        data: clusterData,
        searchFilter: querySearchFilter,
    });

    return (
        <>
            <PageTitle title={`Platform CVEs - PlatformCVE ${cveName}`} />
            <PageSection variant="light" className="pf-v5-u-py-md">
                <Breadcrumb>
                    <BreadcrumbItemLink to={workloadCveOverviewCvePath}>
                        Platform CVEs
                    </BreadcrumbItemLink>
                    <BreadcrumbItem isActive>
                        {cveName ?? <Skeleton screenreaderText="Loading CVE name" width="200px" />}
                    </BreadcrumbItem>
                </Breadcrumb>
            </PageSection>
            <Divider component="div" />
            <PageSection variant="light">
                <CvePageHeader data={platformCveMetadata} />
            </PageSection>
            <Divider component="div" />
            <PageSection className="pf-v5-u-flex-grow-1">
                <div className="pf-v5-u-background-color-100 pf-v5-u-flex-grow-1 pf-v5-u-p-lg">
                    <AffectedClustersTable tableState={tableState} />
                </div>
            </PageSection>
        </>
    );
}

export default PlatformCvePage;

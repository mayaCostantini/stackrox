import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
    PageSection,
    Breadcrumb,
    Divider,
    BreadcrumbItem,
    Skeleton,
    Bullseye,
    Tab,
    Tabs,
    TabsComponent,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import PageTitle from 'Components/PageTitle';
import BreadcrumbItemLink from 'Components/BreadcrumbItemLink';
import EmptyStateTemplate from 'Components/EmptyStateTemplate';
import useURLStringUnion from 'hooks/useURLStringUnion';
import { getAxiosErrorMessage } from 'utils/responseErrorUtils';

import { detailsTabValues } from '../../types';
import { getOverviewPagePath } from '../../utils/searchUtils';

import NodePageHeader, { NodeMetadata, nodeMetadataFragment } from './NodePageHeader';
import NodePageVulnerabilities from './NodePageVulnerabilities';
import NodePageDetails from './NodePageDetails';

const nodeCveOverviewPath = getOverviewPagePath('Node', {
    entityTab: 'Node',
});

const nodeMetadataQuery = gql`
    ${nodeMetadataFragment}
    query getNodeMetadata($id: ID!) {
        node(id: $id) {
            ...NodeMetadata
        }
    }
`;

// TODO - Update for PF5
function NodePage() {
    const { nodeId } = useParams() as { nodeId: string };

    const { data, error } = useQuery<{ node: NodeMetadata }, { id: string }>(nodeMetadataQuery, {
        variables: { id: nodeId },
    });

    const [activeTabKey, setActiveTabKey] = useURLStringUnion('detailsTab', detailsTabValues);

    const vulnTabKey = detailsTabValues[0];
    const detailTabKey = detailsTabValues[1];

    const nodeName = data?.node?.name ?? '-';

    return (
        <>
            <PageTitle title={`Node CVEs - Node ${nodeName}`} />
            <PageSection variant="light" className="pf-v5-u-py-md">
                <Breadcrumb>
                    <BreadcrumbItemLink to={nodeCveOverviewPath}>Nodes</BreadcrumbItemLink>
                    <BreadcrumbItem isActive>
                        {nodeName ?? (
                            <Skeleton screenreaderText="Loading Node name" width="200px" />
                        )}
                    </BreadcrumbItem>
                </Breadcrumb>
            </PageSection>
            <Divider component="div" />
            {error ? (
                <PageSection variant="light">
                    <Bullseye>
                        <EmptyStateTemplate
                            title={getAxiosErrorMessage(error)}
                            headingLevel="h2"
                            icon={ExclamationCircleIcon}
                            iconClassName="pf-v5-u-danger-color-100"
                        />
                    </Bullseye>
                </PageSection>
            ) : (
                <>
                    <PageSection variant="light">
                        <NodePageHeader data={data?.node} />
                    </PageSection>
                    <PageSection padding={{ default: 'noPadding' }}>
                        <Tabs
                            activeKey={activeTabKey}
                            onSelect={(e, key) => {
                                setActiveTabKey(key);
                                // pagination.setPage(1);
                            }}
                            component={TabsComponent.nav}
                            className="pf-v5-u-pl-md pf-v5-u-background-color-100"
                            role="region"
                        >
                            <Tab eventKey={vulnTabKey} title={vulnTabKey} />
                            <Tab eventKey={detailTabKey} title={detailTabKey} />
                        </Tabs>
                    </PageSection>
                    <PageSection
                        isFilled
                        padding={{ default: 'noPadding' }}
                        className="pf-v5-u-display-flex pf-v5-u-flex-direction-column"
                        aria-label={activeTabKey}
                        role="tabpanel"
                        tabIndex={0}
                    >
                        {activeTabKey === vulnTabKey && <NodePageVulnerabilities />}
                        {activeTabKey === detailTabKey && <NodePageDetails />}
                    </PageSection>
                </>
            )}
        </>
    );
}

export default NodePage;

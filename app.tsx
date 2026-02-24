import React, { useCallback, useState } from "react";

import DataGrid, {
  Column,
  Selection,
  Scrolling,
  Paging,
  HeaderFilter,
} from "devextreme-react/data-grid";
import type { DataGridTypes } from "devextreme-react/data-grid";
import Button from "devextreme-react/button";
import ODataStore from 'devextreme/data/odata/store';

const usersDataSource = new ODataStore({
  key: "UserName",
  url: "/odata/Users",
  version: 4,
  beforeSend(request) {
    // Intercept and fix filter for collection properties
    if (request.params && request.params.$filter) {
      // Replace contains on SourceTags collection with proper any lambda
      request.params.$filter = request.params.$filter.replace(
        /contains\(tolower\(SourceTags\),\s*'([^']+)'\)/gi,
        (match: string, value: string) => {
          // Capitalize first letter of each word to match exact values
          const formatted = value.split(' ').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          return `SourceTags/any(tag: tag eq '${formatted}')`;
        }
      );
    }
  },
  onLoaded(result) {
    // Post-process: Add sourceTagsFlat property to each item
    return result.map((item: any) => ({
      ...item,
      sourceTagsFlat: item.SourceTags ? item.SourceTags.join(', ') : ''
    }));
  }
});

const calculateSourceTagsFilter = (filterValue: any) => {
  return ['SourceTags', 'contains', filterValue];
};

const App = () => {

  return (
    <div>
      <h2>DevExtreme DataGrid Demo</h2>
      <DataGrid
        id="grid-container"
        dataSource={usersDataSource}
        remoteOperations={true}
        showBorders={true}
      >
        <Selection 
          mode="multiple" 
          deferred={true}  
          selectAllMode="allPages"
          allowSelectAll
          showCheckBoxesMode="always" />
        <HeaderFilter visible={true} />
        {/* <Pager visible={true} /> */}
        <Paging enabled defaultPageSize={10} />
        <Scrolling
          mode="infinite"
          preloadEnabled
          useNative={false}
          columnRenderingMode="virtual"
        />
        <Column caption="Username" dataField="UserName" width="auto" allowFiltering={false} allowHeaderFiltering={false} />
        <Column caption="First Name" dataField="FirstName" width="auto" allowFiltering={false} allowHeaderFiltering={false} />
        <Column caption="Last Name" dataField="LastName" width="auto" allowFiltering={false} allowHeaderFiltering={false} />
        <Column caption="Gender" dataField="Gender" width="auto" allowFiltering={true} allowHeaderFiltering={true}>
          <HeaderFilter 
            allowSelectAll={false}
            dataSource={[
              { text: 'Male', value: 'Male' },
              { text: 'Female', value: 'Female' }
            ]}
          />
        </Column>
        <Column 
          caption="Source Tags" 
          width="auto"

          calculateFilterExpression={calculateSourceTagsFilter}
          calculateCellValue={(rowData: any) => {
            const tags = rowData.SourceTags ?? [];
            return Array.isArray(tags) ? tags.join(', ') : tags;
          }}
          allowFiltering={true}
          allowHeaderFiltering={true}
        >
          <HeaderFilter 
            allowSelectAll={false}
            dataSource={[
              { text: 'Provider A', value: 'Provider A' },
              { text: 'Provider B', value: 'Provider B' },
              { text: 'Provider C', value: 'Provider C' },
              { text: 'Windows', value: 'Windows' }
            ]}
          />
        </Column>
      </DataGrid>
    </div>
  );
};

export default App;
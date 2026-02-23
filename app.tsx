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
import CustomStore from "devextreme/data/custom_store";

const usersDataSource = new CustomStore({
  key: "UserName",
  load: async (loadOptions) => {
    let url = '/odata/Users?';
    const params = new URLSearchParams();
    
    // Handle filtering
    if (loadOptions.filter) {
      console.log('Filter received:', JSON.stringify(loadOptions.filter, null, 2));
      const filterStr = buildODataFilter(loadOptions.filter);
      console.log('OData filter string:', filterStr);
      if (filterStr) {
        params.append('$filter', filterStr);
      }
    }
    
    // Handle pagination
    if (loadOptions.skip) {
      params.append('$skip', loadOptions.skip.toString());
    }
    if (loadOptions.take) {
      params.append('$top', loadOptions.take.toString());
    }
    
    // Handle sorting
    if (loadOptions.sort) {
      const sortArray = Array.isArray(loadOptions.sort) ? loadOptions.sort : [loadOptions.sort];
      const sortStr = sortArray
        .map((s: any) => `${s.selector} ${s.desc ? 'desc' : 'asc'}`)
        .join(',');
      params.append('$orderby', sortStr);
    }
    
    params.append('$count', 'true');
    
    const response = await fetch(url + params.toString());
    const data = await response.json();
    
    // Post-process: Add sourceTag property to each item
    const processedData = (data.value || []).map((item: any) => ({
      ...item,
      sourceTagsFlat: item.SourceTags ? item.SourceTags.join(', ') : ''
    }));
    
    return {
      data: processedData,
      totalCount: data['@odata.count'] || data.value?.length || 0
    };
  }
});
  const calculateSourceTagsFilter = (filterValue: any) => {
    return ['sourceTagsFlat', 'contains', `${filterValue}`];
  };
// Helper function to build OData filter expressions
function buildODataFilter(filter: any): string {
  if (!filter) return '';
  
  // Handle array of filters (AND/OR operations)
  if (Array.isArray(filter)) {
    if (filter.length === 0) return '';
    
    // Check if it's a simple filter: [field, operator, value]
    // Simple filters have exactly 3 elements and the second is an operator
    const operators = ['=', '<>', '>', '>=', '<', '<=', 'contains', 'startswith', 'endswith', 'any'];
    if (filter.length === 3 && operators.includes(filter[1])) {
      const [field, op, value] = filter;
      
      // Handle 'any' operator for collections (like SourceTags)
      if (op === 'any') {
        return `${field}/any(${value})`;
      }
      
      // Handle Source Tags filtering
      if (field === 'sourceTagsFlat' || (typeof field === 'string' && field.includes('SourceTags'))) {
        return `SourceTags/any(tag: tag eq '${value}')`;
      }
      
      // Regular field filtering (only equals is used for header filters)
      if (op === '=') {
        return `${field} eq '${value}'`;
      }
      
      return `${field} eq '${value}'`;
    }
    
    // Otherwise, it's a logical operation (AND/OR between filters)
    const parts: string[] = [];
    let operator = 'and';
    
    for (let i = 0; i < filter.length; i++) {
      if (filter[i] === 'and' || filter[i] === 'or' || filter[i] === '!') {
        operator = filter[i];
      } else {
        const part = buildODataFilter(filter[i]);
        if (part) parts.push(part);
      }
    }
    
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    return `(${parts.join(` ${operator} `)})`;
  }
  
  return '';
}

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
          filterType="include"
          dataField="sourceTagsFlat"
          calculateFilterExpression={calculateSourceTagsFilter}
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
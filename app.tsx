import React, { useCallback, useState } from "react";

import DataGrid, {
  Column,
  FilterRow,
  Selection,
  Pager,
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
      const filterStr = buildODataFilter(loadOptions.filter);
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
    
    return {
      data: data.value || [],
      totalCount: data['@odata.count'] || data.value?.length || 0
    };
  }
});

// Helper function to build OData filter expressions
function buildODataFilter(filter: any): string {
  if (!filter) return '';
  
  // Handle array of filters (AND/OR operations)
  if (Array.isArray(filter)) {
    if (filter.length === 0) return '';
    
    // Check if it's a simple filter: [field, operator, value]
    // Simple filters have exactly 3 elements and the second is an operator
    const operators = ['=', '<>', '>', '>=', '<', '<=', 'contains', 'startswith', 'endswith'];
    if (filter.length === 3 && operators.includes(filter[1])) {
      const [field, op, value] = filter;
      console.log('Building filter for:', field, op, value);
      // Handle Source Tags filtering
      if (field === 'SourceTags' || (typeof field === 'string' && field.includes('SourceTags'))) {
        return `SourceTags/any(tag: tag eq '${value}')`;
      }
          console.log('Building filter for:', field, op, value);
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
        <Selection mode="multiple" deferred={true} />
        <HeaderFilter visible={true} />
        <Pager visible={true} />
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
          dataField="SourceTags"
          calculateCellValue={(rowData: any) => {
            const sourceTags = rowData.SourceTags ?? [];
            return sourceTags.join(', ');
          }}
          allowFiltering={true}
          allowHeaderFiltering={true}
        >
          <HeaderFilter 
            allowSelectAll={true}
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
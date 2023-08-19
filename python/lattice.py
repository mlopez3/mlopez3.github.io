"""
Tool creating distributive lattices and Galois connections between them.
For full interactivity may need to rewrite all of this in javascript
Need json link data file with sources and targets
"""
import itertools as it
import json
import numpy as np

def issublist(lst1,lst2):
    return set(lst1).issubset(set(lst2))

def isProperSublist(lst1,lst2):
    return set(lst1) < set(lst2)

def ind_to_str(values, index_set):
    indices = list(index_set)
    indices.sort()
    string = ''
    for ind in indices:
        if string == '': string += values[ind]
        else: string += (',' + values[ind])
    return string

def str_to_ind(values, string):
    if string == '':
        return []
    indices = []
    split_string = string.split(',')
    for s in split_string:
        indices.append(values.index(s))
    return indices

class Lattice:
    # gen_set = list of sets
    # values = list of strings
    # gen_set must have an index for every value or
    # future fucntions wont work
    def __init__(self, values, gen_sets): 
        self.gen_sets = [ list(x) for x in gen_sets ]
        self.values = values   
        self.dep = dict()
        num_sets = len(gen_sets)
        flat_list = [item for sublist in gen_sets for item in sublist]
        if len(values) < max(flat_list):
            raise Exception("Too few values")
        for i in range(0, num_sets):
            comb = it.combinations(gen_sets, num_sets - i) 
            for subsets in comb:
                intr = set.intersection(*subsets)
                union = set.union(*subsets)
                intr_str = ind_to_str(values, intr)
                union_str = ind_to_str(values, union)
                if intr_str not in self.dep:
                    self.dep[intr_str] = { "parents" : [], "children" : []}
                if union_str not in self.dep:
                    self.dep[union_str] = { "parents" : [], "children" : []}
                missingelem = [ x for x in gen_sets if x not in subsets ]
                for x in missingelem:
                    appended = list(subsets)
                    appended.append(x)
                    app_intr = set.intersection(*appended)
                    app_union = set.union(*appended)
                    app_intr_str = ind_to_str(values, app_intr)
                    app_union_str = ind_to_str(values, app_union)
                    if app_intr != intr:
                        self.dep[app_intr_str]["parents"].append(intr)
                        self.dep[intr_str]["children"].append(app_intr)
                    if app_union != union:
                        self.dep[app_union_str]["children"].append(union)
                        self.dep[union_str]["parents"].append(app_union)

        # prune redundancies below for each element
        for elem in self.dep:               
            parents = self.dep[elem]["parents"]
            children = self.dep[elem]["children"]
            not_reduced = True
            while not_reduced and parents != []:
                flag_found = False
                for parent in parents:
                    if flag_found: break  
                    spouses = parents.copy()
                    spouses.remove(parent)
                    for spouse in spouses:
                        if spouse.issubset(parent):
                            parents.remove(parent)
                            flag_found = True
                            break
                        flag_found = False              
                if not flag_found: not_reduced = False

            not_reduced = True
            while not_reduced and children != []:
                flag_found = False
                for child in children:
                    if flag_found: break
                    siblings = children.copy()
                    siblings.remove(child)
                    for sibling in siblings:
                        if child.issubset(sibling):
                            children.remove(child)
                            flag_found = True
                            break
                        flag_found = False
                if not flag_found: not_reduced = False

    def lattice(self):
        # return list of elements [[ indices of set], [indices of subsets], [indices of supsets]]
        lattice = list()
        index_dict = {}
        count = 0
        for item in self.dep:
            lst = str_to_ind(self.values, item)
            lattice.append([lst,[],[]])
            index_dict[item] = count
            count += 1
        for item in self.dep:
            lst = str_to_ind(self.values, item)
            lattice[index_dict[item]][1] = [index_dict[ind_to_str(self.values, child)] for child in self.dep[item]["children"] ]
            lattice[index_dict[item]][2] = [index_dict[ind_to_str(self.values, parent)] for parent in self.dep[item]["parents"] ]
        return lattice


    def to_json(self):
        dict = {"values" : self.values,
                "layers" : self.layers(),
                "links" : self.links(),
                "lattice" : self.lattice(),
                "generators": self.gen_sets}
        outputFile = open("lattice_viz/data/lattice2.json", "w")
        json.dump(dict, outputFile) 

    # write a function to compute the layers of the 
    # plotted lattice nodes. could include this data
    # in the outputted json file
    # each list in layers contains indices from self.lattice()
    # list
    def layers(self):
        layers = list()
        lat = self.lattice()
        # first element of lat is always the bottom element(?)
        layers.append([0])
        at_top = False
        while not at_top:
            next_layer = [ parent for i in layers[-1] for parent in lat[i][-1] ]
            # check no two elements in a layer are comparable
            not_reduced = True
            while not_reduced:
                flag = False
                for node_ind1 in next_layer:
                    if flag: break
                    siblings = next_layer.copy()
                    siblings.remove(node_ind1)
                    for node_ind2 in siblings:
                        if node_ind1 in lat[node_ind2][-1] or node_ind1 == node_ind2:
                            next_layer.remove(node_ind1)
                            flag = True
                            break
                if not flag: not_reduced = False
            # commit next layer
            layers.append(next_layer)
            if next_layer == [1]:
                at_top = True
        return layers
    
    def links(self):
        lat = self.lattice()
        num_nodes = len(lat)
        links = []
        for node in range(num_nodes):
            for parent in lat[node][-1]:
                links.append(
                    {"source" : node,
                     "target" : parent}
                )
        return links
    
    def smallestElementContaining(self, entries):
        lat = self.lattice()
        lat_nodes = [x[0] for x in lat]
        cur = list(range(len(self.values)))
        is_best = False
        while not is_best:
            cur_ind = lat_nodes.index(cur)
            children_ind = lat[cur_ind][1]
            if children_ind == []:
                is_best = True
                break
            for ind in children_ind:
                is_best = True
                if issublist(entries, lat_nodes[ind]):
                    cur = lat_nodes[ind]
                    is_best = False
                    break
        return cur
    
    def largestElementContainedIn(self, entries):
        lat = self.lattice()
        lat_nodes = [x[0] for x in lat]
        cur = []
        is_best = False
        while not is_best:
            cur_ind = lat_nodes.index(cur)
            parents_ind = lat[cur_ind][2]
            if parents_ind == []:
                is_best = True
                break
            for ind in parents_ind:
                is_best = True
                if issublist(lat_nodes[ind], entries):
                    cur = lat_nodes[ind]
                    is_best = False
                    break
        return cur
    
class Relation:
    # domain = Lattice object
    # codomian = Lattice object
    # array = |domain| x |codomain| numpy boolean matrix
    def __init__(self, domain, codomain, array):
        self.domain = domain
        self.codomain = codomain
        self.array = array
        self.dom_lat = domain.lattice()
        self.cod_lat = codomain.lattice()
        return
    
     
    def left_adjoint(self):
        # return list of tuples (a,b) where a \in domain
        # b = R_\bullet(a) \in codomain 
        mappings = []
        cod_nodes = [x[0] for x in self.cod_lat]
        for index in range(len(self.dom_lat)):
            entries = self.dom_lat[index][0]
            image = []
            for y in range(len(self.codomain.values)):
                # add y's to the image list
                flag = False
                for item in entries:
                    if self.array[item, y]:
                        flag = True 
                if flag: image.append(y)
            new_image = self.codomain.smallestElementContaining(image)
            image_ind = cod_nodes.index(new_image)
            mappings.append( [index, image_ind] )
        return mappings
    
    def right_adjoint(self):
        # return list of tuples (b,a) where b \in codomain
        # a = R^\bullet(b) \in domain 
        mappings = []
        dom_nodes = [x[0] for x in self.dom_lat]
        for index in range(len(self.cod_lat)):
            entries = self.cod_lat[index][0]
            image = []
            for x in range(len(self.domain.values)):
                # add x's to the image list
                rel_set = []
                for y in range(len(self.codomain.values)):
                    if( self.array[x,y]):rel_set.append(y)
                if (issublist(rel_set, entries)): image.append(x)
            new_image = self.domain.largestElementContainedIn(image)
            image_ind = dom_nodes.index(new_image)
            mappings.append( [index, image_ind] )
        return mappings
    
    def to_json(self):
        dict_dom = {
            "values" : self.domain.values,
            "layers" : self.domain.layers(),
            "links" : self.domain.links(),
            "lattice" : self.domain.lattice(),
            "generators": self.domain.gen_sets
            }
        dict_cod = {
            "values" : self.codomain.values,
            "layers" : self.codomain.layers(),
            "links" : self.codomain.links(),
            "lattice" : self.codomain.lattice(),
            "generators": self.codomain.gen_sets
            }
        combined = {'lat1': dict_dom, 
                    'lat2': dict_cod,
                    'left_adj': self.left_adjoint(),
                    'right_adj': self.right_adjoint()}
        outputFile = open("data/rel.json", "w")
        json.dump(combined, outputFile) 
    
    def isGalConn(self, left, right):
        dom_nodes = [x[0] for x in self.dom_lat]
        cod_nodes = [x[0] for x in self.cod_lat]
        for pair in left:
            
            right_pair = right[pair[1]]
            if isProperSublist( dom_nodes[right_pair[1]], dom_nodes[pair[0]]):
                print(pair)
                print(right_pair)
                return False
        for pair in right:
            left_pair = left[pair[1]]
            if isProperSublist(cod_nodes[pair[0]], cod_nodes[left_pair[1]]):
                print(pair)
                print(left_pair)
                return False
        return True


""" Test Code """
lat1 = Lattice(["a","b","c","d","e"], [{0},{1},{2,3},{1,4},{0,4},{0,2,4}])
lat2 = Lattice(["x","y","z","w",'u'], [{0},{1},{2},{3},{4}])
array = np.array([[1,0,1,0,1],
                  [0,1,0,1,0],
                  [1,0,1,0,1],
                  [1,1,0,1,0],
                  [1,1,1,1,0]])
rel = Relation(lat1, lat2, array)
#print(rel.left_adjoint())
#print(rel.right_adjoint())
#left = rel.left_adjoint()
#right = rel.right_adjoint()
#print(rel.isGalConn(left, right))
#print(lat.dep)
#print("Lattice notation")
#print(lat.lattice())
#print(lat.layers())
rel.to_json()